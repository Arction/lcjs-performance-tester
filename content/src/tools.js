
// Common tools for constructing TestItems.
// These are concated to data.js before tests/*.js as text.
// predefined variable data is an array that should have TestItems appended into it.

/**
 * Passing license key here as string should apply it to performance tests.
 * TODO: Currently license verification doesn't work from inside i-frame, so this does NOT work!
 */
var licenseKey = undefined

var _GroupFactory = function (target, keySuffix = '') {
    return function (params) {
        // Create empty TestGroup item.
        const groupItem = {
            key: keySuffix + params.key + ' ',
            label: params.label,
            defaultCollapsed: params.defaultCollapsed,
            defaultSelected: params.defaultSelected,
            members: []
        }
        // Append item to owner.
        target.push(groupItem)
        // Return factory for adding Test items to Group.
        var group = {
            /**
             * @param   { key, label, code, defaultSelected }    params
             */
            Test: function (params) {
                groupItem.members.push({
                    key: groupItem.key + params.key,
                    label: params.label,
                    code: params.code,
                    defaultSelected: params.defaultSelected,
                })
                return group
            },
            /**
             * @param   { key, label, defaultCollapsed, defaultSelected } params
             */
            Group: _GroupFactory(groupItem.members, groupItem.key)
        }
        return group
    }
}
/**
 * @param   { key, label, defaultSelected, defaultCollapsed } params
 */
var Group = _GroupFactory(data)

// TODO: Currently we can't catch errors that happen during Chart rendering!
// (mainly meaning browser specific problems and running out of resources!)

/**
 * Utility function which generates a template for perf test using a couple of abstract callbacks.
 * @param   { template for: () => Promise<Data> }   generateData   Function which generates data for test to use.
 * @param   { template for: (Data) => Env }         initChart      Function which creates chart, adds initial data and returns environmental variables for the test.
 * @param   { template for: (Env) => Promise }      run            Function which runs the test and calls 'onOver' when done.
 * @return  Perf test code as string.
 */
var ProtoTestCode = function (
    locateChart,
    generateData,
    initChart,
    run
) {
    return `
var tStart = window.performance.now();
// Event 1) Start.
testEvent('start', {
    time: tStart
});

var locatedChart = (${locateChart})()

// Event 2) Start Data generation.
testEvent('start_data_gen', {
    time: tStart
});
try {
    (${generateData})()
        .then(
            function(data){ 
                // Event 3) Finish Data generation.
                testEvent('finish_data_gen', {
                    time: window.performance.now()
                });
                setTimeout(function(){ 
                    // Event 4) Initialize Chart.
                    testEvent('init_chart', {
                        time: window.performance.now()
                    });
                    try {
                        var env = (${initChart})(data, locatedChart);
    
                        // Check that requestAnimationFrame is supported by browser.
                        if (! window.requestAnimationFrame)
                            throw new Error('ProtoTestCode error: requestAnimationFrame is not supported by browser! Please use a different browser.')
    
                        // Setup FPS measuring using window.requestAnimationFrame.
                        let sum = 0
                        let count = 0
                        let averageFPS = 0
                        let lastFrame
                        var onFrame = function(first){ 
                            if (first) {
                                // Event 5) First frame.
                                testEvent('first_frame', {
                                    time: window.performance.now()
                                });
                                try {
                                    (${run})(env)
                                        .then(
                                            function(){ 
                                                // Event 6) Record average FPS.
                                                testEvent('record_averageFPS', {
                                                    averageFPS:averageFPS
                                                });
                                                // Event 7) Test completed.
                                                testEvent('test_completed', {
                                                    time: window.performance.now()
                                                });
                                            },
                                            function(e){ 
                                                // Test error.
                                                console.log(e)
                                                testEvent('test_error', {
                                                    time: window.performance.now()
                                                });
                                            }
                                        );
                                } catch (e) {
                                    // Unexpected test run error.
                                    console.log(e)
                                    testEvent('test_error', {
                                        time: window.performance.now()
                                    });
                                }
                            }
                            var now = window.performance.now()
                            count++
                            if ( lastFrame !== undefined ) {
                                sum += now - lastFrame
                                // ----- Average FPS computation -----
                                averageFPS = 1000 / ( sum / count )
                            }
                            lastFrame = now
                            window.requestAnimationFrame(function(){ return onFrame(false)})
                        }
                        window.requestAnimationFrame(function(){ return onFrame(true)})
    
                    } catch (e) {
                        // Unexpected test init error.
                        console.log(e)
                        testEvent('test_error', {
                            time: window.performance.now()
                        });
                    }
                });
            },
            function(e){ 
                // Data generation error.
                console.log(e)
                testEvent('test_error', {
                    time: window.performance.now()
                });
            }
        )
} catch (e) {
    // Unexpected data generation error.
    console.log(e)
    testEvent('test_error', {
        time: window.performance.now()
    });
}
`
}

/**
 * Template factory for data streaming function, that tries to time data streaming nicely based on requested test duration.
 * NOTE: Utilizes predefined variables: env & testDuration
 *
 * Assumes following env parameters from initChart: 'data' and 'series'
 */
var StreamData = function (relax = false) {
    return `
        function (env) {
            var data = env.data
            var series = env.series
            if (! ('length' in series)) series = [series]
            return new Promise(function (resolve, reject) {
                var tStart = window.performance.now()
                var relaxTime = ${relax} ? Math.min(1000, testDuration * .2) : 0
                var pointCount = data.length
                var addedPointCount = 0
                var iData = setInterval(function() {
                    var tNow = window.performance.now()
                    var dataToAddCount = Math.floor(((tNow - tStart) / (testDuration - relaxTime)) * pointCount - addedPointCount)
                    var splicedData = data.splice(0, dataToAddCount)
                    for (var i = 0; i < series.length; i++){
                        var s = series[i]
                        s.add(splicedData)
                    }
                    addedPointCount += dataToAddCount
                    if (data.length == 0) {
                        clearInterval(iData)
                        setTimeout(resolve, relaxTime)
                    }
                }, 32)
            })
        }`
}