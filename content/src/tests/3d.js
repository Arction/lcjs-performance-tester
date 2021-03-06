// 3D tests
// Everything defined in tools.js is usable here.

var tests3D = Group({
    key: '3D',
    label: '3D'
})

var locateChart3D = function (conf) {
    var title = conf && conf.title ? conf.title : ''
    return `function() {
        var lightningChart = require('lcjs').lightningChart
        var chart = lightningChart().Chart3D()
            .setTitle("${title}")
        chart.setCameraLocation({x: 1.0489653067913933, y: 0.5640370604112517, z: 0.5555008268409382})
        return chart
    }`
}

// ----- Shared test suite for following 3D series types: -----
// - Point Series 3D
// - Point Cloud Series 3D
// - Line Series 3D
// - Point Line Series 3D
// #region

;(function () {

    var generateScatterData3D = function (pointsAmount) {
        return `function () {
            return new Promise(function (resolve, reject) {
                var points = []
                for (var i = 0; i < ${pointsAmount}; i ++) {
                    var x = Math.random() * 100
                    var y = Math.random() * 100
                    var z = i
                    points.push({x,y,z})
                }
                resolve(points)
            })
        }`
    }

    var generateTraceData3D = function (pointsAmount) {
        return `function () {
            return new Promise(function (resolve, reject) {
                var points = []
                var xy = []
                for (var ang = 0; ang <= 360; ang ++) {
                    var rad = ang * Math.PI / 180
                    xy[ang] = {x: 100 * (0.5 + Math.cos(rad) / 2), y: 100 * (0.5 + Math.sin(rad) / 2)}
                }
                var angStepDeg = 2
                var radiusStep = 0.001
                for (var i = 0; i < ${pointsAmount}; i ++) {
                    var ang = Math.round(i * angStepDeg % 360)
                    var radius = 0.75 + 0.25 * Math.sin(i * radiusStep)
                    var x = xy[ang].x * radius
                    var y = xy[ang].y * radius
                    var z = i
                    points.push({x,y,z})
                }
                resolve(points)
            })
        }`
    }

    var groupsInfo = [
        {
            key: 'pointSeries3D cube',
            label: 'Point Series 3D \'cube\'',
            featureName: 'Point Series 3D',
            preview: 'point-series-3D.png',
            pointAmounts: [
                100 * 1000,
                250 * 1000,
                500 * 1000,
                1000 * 1000,
                1500 * 1000
            ],
            generator: generateScatterData3D,
            initSeries: `
                var series = chart.addPointSeries()
                    .setPointStyle(function (style) {
                        var pointSize = Math.max(1, Math.round( 14 - 2 * Math.log10( data.length ) ))
                        return style.setSize(pointSize).setShape('cube')
                    })
                `
        },
        {
            key: 'pointCloudSeries3D',
            label: 'Point Cloud Series 3D',
            featureName: 'Point Cloud Series 3D',
            defaultSelected: ({ pointAmount }) => pointAmount === 250 * 1000,
            pointAmounts: [
                100 * 1000,
                250 * 1000,
                500 * 1000,
                1000 * 1000,
                1500 * 1000
            ],
            generator: generateScatterData3D,
            initSeries: `
                var { PointSeriesTypes3D } = require('lcjs')
                var series = chart.addPointSeries({ type: PointSeriesTypes3D.Pixelated })
                    .setPointStyle(function (style) {
                        var pointSize = Math.max(1, Math.round( 14 - 2 * Math.log10( data.length ) ))
                        return style.setSize(pointSize)
                    })
                `
        },
        {
            key: 'lineSeries3D',
            label: 'Line Series 3D',
            featureName: 'Line Series 3D',
            defaultSelected: ({ pointAmount }) => pointAmount === 25 * 1000,
            pointAmounts: [
                10 * 1000,
                25 * 1000,
                100 * 1000,
                250 * 1000,
                500 * 1000
            ],
            generator: generateTraceData3D,
            initSeries: `
                var series = chart.addLineSeries()
                    .setLineStyle(function (style) {
                        var lineThickness = Math.max(1, Math.round( 14 - 2 * Math.log10( data.length ) ))
                        return style
                            .setThickness(lineThickness)
                    })
                `
        },
        {
            key: 'pointLineSeries3D sphere',
            label: 'Point Line Series 3D \'sphere\'',
            featureName: 'Point Line Series 3D',
            defaultSelected: ({ pointAmount }) => pointAmount === 25 * 1000,
            pointAmounts: [
                10 * 1000,
                25 * 1000,
                100 * 1000,
                250 * 1000,
                500 * 1000
            ],
            generator: generateTraceData3D,
            initSeries: `
                var { SolidFill, ColorRGBA } = require('lcjs')
                var series = chart.addPointLineSeries()
                    .setPointStyle(function (style) {
                        var pointSize = 10
                        return style.setSize(pointSize).setShape('sphere').setFillStyle(new SolidFill({color: ColorRGBA(255,0,0)}))
                    })
                    .setLineStyle(function (style) {
                        var lineThickness = 2
                        return style.setThickness(lineThickness)
                    })
                `
        }
    ]
    
    for (var groupInfo of groupsInfo) {
        var group = tests3D.Group(groupInfo)
        var groupRealtime = group.Group({
            key: 'realtime',
            label: 'Realtime'
        })
        var groupStatic = group.Group({
            key: 'static',
            label: 'Static'
        })
        for (var pointAmount of groupInfo.pointAmounts) {
            groupStatic.Test({
                key: `${pointAmount/1000} k`,
                label: `${pointAmount/1000} k points`,
                code: ProtoTestCode(
                    locateChart3D({ title: `${groupInfo.featureName} ${pointAmount/1000} k points` }),
                    groupInfo.generator(pointAmount),
                    `function (data, chart) {
                        chart.getDefaultAxisX().setInterval(0, 100, false, true)
                        chart.getDefaultAxisY().setInterval(0, 100, false, true)
                        chart.getDefaultAxisZ().setInterval(0, data.length, false, true)
                        ${groupInfo.initSeries}
                        series.add(data)
                        return {
                            data: data,
                            series: series
                        }
                    }`,
                    `function (env) {
                        return new Promise(function (resolve, reject) {
                            setTimeout(resolve, 1000)
                        })
                    }`
                )
            })
            groupRealtime.Test({
                defaultSelected: groupInfo.defaultSelected && groupInfo.defaultSelected({pointAmount}),
                key: `${pointAmount/1000} k`,
                label: `${pointAmount/1000} k points`,
                code: ProtoTestCode(
                    locateChart3D({ title: `${groupInfo.featureName} ${pointAmount/1000} k points realtime` }),
                    groupInfo.generator(pointAmount),
                    `function (data, chart) {
                        chart.getDefaultAxisX().setInterval(0, 100, false, true)
                        chart.getDefaultAxisY().setInterval(0, 100, false, true)
                        chart.getDefaultAxisZ().setInterval(0, data.length, false, true)
                        ${groupInfo.initSeries}
                        return {
                            data: data,
                            series: series
                        }
                    }`,
                    StreamData(pointAmount, false)
                )
            })
        }
    }
})()

// #endregion

// #region ----- Surface Grid Series -----

;(function () {

    var groupsInfo = [
        {
            defaultSelected: ({ dataResolution, usePalette }) => usePalette === true && dataResolution === 50,
            key: 'surfaceGrid3D',
            label: 'Surface Grid 3D',
            dataResolutions: [
                // 50 x 50 = 2500
                50,
                // 75 x 75 = 5625
                75,
                // 100 x 100 = 10 000
                100,
            ]
        }
    ]

    var generateSpectrogramData = function (dataResolution) {
        return `function () {
            var createSpectrumDataGenerator = require('xydata').createSpectrumDataGenerator
            return createSpectrumDataGenerator()
                .setSampleSize( ${dataResolution} )
                .setNumberOfSamples( ${dataResolution} )
                .setVariation( 3 )
                .generate()
                .toPromise()
                // Scale Y values from [0.0, 1.0] to [0.0, 80]
                .then( function(sample) {
                    return sample.map( function(yArr) {
                        return yArr.map(function(y) {
                            return y * 80
                        })
                    } )
                } )
        }`
    }

    var initChartCode = function (addDataImmediately, usePalette) {
        return `function (data, chart) {
            var { SurfaceSeriesTypes3D, LUT, PalettedFill, SolidFill, ColorRGBA } = require('lcjs')

            chart.getDefaultAxisX().setInterval(0, ${dataResolution}, false, true)
            chart.getDefaultAxisY().setInterval(0, 80, false, true)
            chart.getDefaultAxisZ().setInterval(0, ${dataResolution}, false, true)

            var lut = new LUT( {
                steps: [
                    { value: 0, color: ColorRGBA( 4, 11, 125 ) },
                    { value: 15, color: ColorRGBA( 4, 11, 125 ) },
                    { value: 30, color: ColorRGBA( 4, 130, 5 ) },
                    { value: 60, color: ColorRGBA( 132, 15, 4 ) },
                    { value: 100, color: ColorRGBA( 255, 255, 0 ) }
                ],
                interpolate: true
            } )
            var paletteFill = new PalettedFill( { lut, lookUpProperty: 'y' } )

            var rows = ${dataResolution} - 1
            var columns = ${dataResolution} - 1
            var series = chart.addSurfaceSeries( {
                type: SurfaceSeriesTypes3D.Grid,
                rows,
                columns,
                start: { x: 0, z: ${dataResolution} },
                end: { x: ${dataResolution}, z: 0 },
                pixelate: true
            } )
            ${usePalette ? `series.setFillStyle( paletteFill )` : 'series.setFillStyle(new SolidFill({ color: ColorRGBA(172, 30, 20) }))'}

            ${addDataImmediately ? `series.addRow( ${dataResolution}, 'y', data )` : ''}
            
            return {
                data: data,
                series: series
            }
        }`
    }

    var streamSpectrogramData = StreamAbstractData(
        `function(dataToAddCount, data, addedPointCount, series) {
            var samples = data.splice(0, dataToAddCount)
            series[0].addRow(dataToAddCount, 'y', samples)
        }`
    )

    for (var groupInfo of groupsInfo) {
        var group = tests3D.Group(groupInfo)
        var groupScrolling = group.Group({
            key: 'scrolling',
            label: 'scrolling'
        })
        var groupStatic = group.Group({
            key: 'static',
            label: 'Static'
        })
        for (var usePalette of [false, true]) {
            var usePaletteLabel = usePalette ? ' palette' : ''
            for (var dataResolution of groupInfo.dataResolutions) {
                groupStatic.Test({
                    key: `${dataResolution}x${dataResolution}${usePaletteLabel}`,
                    label: `${dataResolution}x${dataResolution}${usePaletteLabel}`,
                    code: ProtoTestCode(
                        locateChart3D({ title: `Surface Grid Series 3D ${dataResolution}x${dataResolution}` }),
                        generateSpectrogramData(dataResolution),
                        initChartCode(true, usePalette),
                        `function (env) {
                            return new Promise(function (resolve, reject) {
                                setTimeout(resolve, 1000)
                            })
                        }`
                    )
                })
                groupScrolling.Test({
                    defaultSelected: groupInfo.defaultSelected && groupInfo.defaultSelected({dataResolution, usePalette}),
                    key: `${dataResolution}x${dataResolution}${usePaletteLabel}`,
                    label: `${dataResolution}x${dataResolution}${usePaletteLabel}`,
                    code: ProtoTestCode(
                        locateChart3D({ title: `Surface Grid Series 3D ${dataResolution}x${dataResolution} realtime` }),
                        generateSpectrogramData(dataResolution),
                        initChartCode(false, usePalette),
                        streamSpectrogramData(dataResolution)
                    )
                })
            }
        }
    }
})()

// #endregion

// #region ----- Surface Mesh Series -----

;(function () {

    var groupsInfo = [
        {
            defaultSelected: ({ dataResolution, usePalette }) => usePalette === true && dataResolution === 50,
            key: 'surfaceMesh3D',
            label: 'Surface Mesh 3D',
            dataResolutions: [
                // 50 x 50 = 2500
                50,
                // 100 x 100 = 10 000
                100,
                // 250 x 250 = 62 500
                250,
                // 500 x 500 = 250 000
                500
            ]
        }
    ]

    var generateSurfaceGeometryData = function (dataResolution) {
        return `function () {
            return new Promise(function (resolve, reject) {
                var data = []
                var rows = ${dataResolution}
                var columns = ${dataResolution}
                var y1 = ( t ) => .3 * Math.sin( t * 4 * Math.PI / columns )
                var y2 = ( t ) => 2.5 + Math.cos( t * 4 * Math.PI / columns )
                for (var row = 0; row < rows; row ++) {
                    data[row] = []
                    for (var column = 0; column < columns; column ++) {
                        var angle = row * 2 * Math.PI / ( rows - 1 )
                        var radius = Math.abs( y2( column ) - y1( column ) )
                        data[row][column] = {
                            x: Math.sin( angle ) * radius,
                            y: 3.55 + Math.cos( angle ) * radius,
                            z: column
                        }
                    }
                }
                resolve(data)
            })
        }`
    }

    var initChartCode = function (addDataImmediately, usePalette, dataResolution) {
        return `function (data, chart) {
            var { SurfaceSeriesTypes3D, LUT, PalettedFill, SolidFill, ColorRGBA } = require('lcjs')

            chart.getDefaultAxisX().setInterval( -3.55, 3.55, false, true )
            chart.getDefaultAxisY().setInterval( 0, 2 * 3.55, false, true )
            chart.getDefaultAxisZ().setInterval( 0, ${dataResolution}, false, true )

            var lut = new LUT( {
                steps: [
                    { value: 0, color: ColorRGBA( 255, 0, 0 ) },
                    { value: 1.0, color: ColorRGBA( 255, 0, 0 ) },
                    { value: 4.0, color: ColorRGBA( 0, 0, 255 ) },
                    { value: 6.0, color: ColorRGBA( 255, 255, 255 ) },
                ],
                interpolate: true
            } )
            var paletteFill = new PalettedFill( { lut, lookUpProperty: 'y' } )

            var rows = ${dataResolution} - 1
            var columns = ${dataResolution} - 1
            var series = chart.addSurfaceSeries( {
                type: SurfaceSeriesTypes3D.Mesh,
                rows,
                columns,
                start: { x: 0, z: ${dataResolution} },
                end: { x: ${dataResolution}, z: 0 },
                pixelate: true
            } )
                .setWireframeStyle(new SolidFill({ color: ColorRGBA(0,0,0, 180) }))
            ${usePalette ? `series.setFillStyle( paletteFill )` : 'series.setFillStyle(new SolidFill({ color: ColorRGBA(172, 30, 20) }))'}

            ${addDataImmediately ? `series.invalidateGeometryOnly(data)` : ''}
            
            return {
                data: data,
                series: series
            }
        }`
    }

    for (var groupInfo of groupsInfo) {
        var group = tests3D.Group(groupInfo)
        for (var usePalette of [false, true]) {
            var usePaletteLabel = usePalette ? ' palette' : ''
            for (var dataResolution of groupInfo.dataResolutions) {
                group.Test({
                    defaultSelected: groupInfo.defaultSelected && groupInfo.defaultSelected({dataResolution, usePalette}),
                    key: `${dataResolution}x${dataResolution}${usePaletteLabel}`,
                    label: `${dataResolution}x${dataResolution}${usePaletteLabel}`,
                    code: ProtoTestCode(
                        locateChart3D({ title: `Surface Mesh Series 3D ${dataResolution}x${dataResolution}` }),
                        generateSurfaceGeometryData(dataResolution),
                        initChartCode(true, usePalette, dataResolution),
                        `function (env) {
                            return new Promise(function (resolve, reject) {
                                setTimeout(resolve, 1000)
                            })
                        }`
                    )
                })
            }
        }
    }
})()

// #endregion


// #region ----- Box 3D Series -----

;(function () {

    var groupsInfo = [
        {
            defaultSelected: ({ dataResolution, usePalette }) => usePalette === true && dataResolution === 100,
            key: 'box3D',
            label: 'Box Series 3D',
            dataResolutions: [
                // 50 x 50 = 2500
                50,
                // 100 x 100 = 10 000
                100,
                // 250 x 250 = 62 500
                250,
                // 500 x 500 = 250 000
                500
            ]
        }
    ]

    var generateSpectrogramData = function (dataResolution) {
        return `function () {
            var createSpectrumDataGenerator = require('xydata').createSpectrumDataGenerator
            return createSpectrumDataGenerator()
                .setSampleSize( ${dataResolution} )
                .setNumberOfSamples( ${dataResolution} )
                .setVariation( 3 )
                .generate()
                .toPromise()
                // Scale Y values from [0.0, 1.0] to [0.0, 80]
                .then( function(data) {
                    return data.map( function(yArr) {
                        return yArr.map(function(y) {
                            return y * 80
                        })
                    } )
                } )
                // Map Y values to a Row of Boxes.
                .then( function(data) {
                    // Map Y values to BoxDataBounds format.
                    var boxes = []
                    data.forEach( function( yArr, sampleIndex ) {
                        boxes.push.apply(boxes, yArr.map(function(y, iX) {
                            return {
                                xMin: iX,
                                xMax: iX + 1.0,
                                yMin: 0,
                                yMax: y,
                                zMin: sampleIndex,
                                zMax: sampleIndex + 1.0,
                                // Color each Box by their sampled Y value (height).
                                value: y
                            }
                        }))
                    })
                    return boxes
                } )
        }`
    }

    var initChartCode = function (addDataImmediately, usePalette) {
        return `function (data, chart) {
            var { LUT, PalettedFill, SolidFill, ColorRGBA } = require('lcjs')

            chart.getDefaultAxisX().setInterval(0, ${dataResolution}, false, true)
            chart.getDefaultAxisY().setInterval(0, 80, false, true)
            chart.getDefaultAxisZ().setInterval(0, ${dataResolution}, false, true)

            var lut = new LUT( {
                steps: [
                    { value: 0, color: ColorRGBA( 4, 11, 125 ) },
                    { value: 15, color: ColorRGBA( 4, 11, 125 ) },
                    { value: 30, color: ColorRGBA( 4, 130, 5 ) },
                    { value: 60, color: ColorRGBA( 132, 15, 4 ) },
                    { value: 100, color: ColorRGBA( 255, 255, 0 ) }
                ],
                interpolate: true
            } )
            var paletteFill = new PalettedFill( { lut, lookUpProperty: 'value' } )

            var series = chart.addBoxSeries()
                .setFillStyle( paletteFill )
                .setRoundedEdges( undefined )
            ${usePalette ? `series.setFillStyle( paletteFill )` : 'series.setFillStyle(new SolidFill({ color: ColorRGBA(172, 30, 20) }))'}

            ${addDataImmediately ? `series.invalidateData(data)` : ''}
            
            return {
                data: data,
                series: series
            }
        }`
    }

    var streamBoxData = function(dataResolution) {
        return StreamAbstractData(
            `function(dataToAddCount, data, addedPointCount, series) {
                var boxes = data.splice(0, dataToAddCount * ${dataResolution})
                series[0].invalidateData(boxes)
            }`
        )(dataResolution)
    }

    for (var groupInfo of groupsInfo) {
        var group = tests3D.Group(groupInfo)
        var groupScrolling = group.Group({
            key: 'scrolling',
            label: 'scrolling'
        })
        var groupStatic = group.Group({
            key: 'static',
            label: 'Static'
        })
        for (var usePalette of [false, true]) {
            var usePaletteLabel = usePalette ? ' palette' : ''
            for (var dataResolution of groupInfo.dataResolutions) {
                groupStatic.Test({
                    key: `${dataResolution}x${dataResolution}${usePaletteLabel}`,
                    label: `${dataResolution}x${dataResolution}${usePaletteLabel}`,
                    code: ProtoTestCode(
                        locateChart3D({ title: `Box Series 3D ${dataResolution}x${dataResolution}` }),
                        generateSpectrogramData(dataResolution),
                        initChartCode(true, usePalette),
                        `function (env) {
                            return new Promise(function (resolve, reject) {
                                setTimeout(resolve, 1000)
                            })
                        }`
                    )
                })
                groupScrolling.Test({
                    defaultSelected: groupInfo.defaultSelected && groupInfo.defaultSelected({usePalette, dataResolution}),
                    key: `${dataResolution}x${dataResolution}${usePaletteLabel}`,
                    label: `${dataResolution}x${dataResolution}${usePaletteLabel}`,
                    code: ProtoTestCode(
                        locateChart3D({ title: `Box Series 3D ${dataResolution}x${dataResolution} realtime` }),
                        generateSpectrogramData(dataResolution),
                        initChartCode(false, usePalette),
                        streamBoxData(dataResolution)
                    )
                })
            }
        }
    }
})()

// #endregion