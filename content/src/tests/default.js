// /**
//  * Everything defined in tools.js is usable here.
//  */

// /**
//  * Template factory for progressive Vec2 generation function.
//  */
// var GenerateProgressive = function (pointCount) {
//     return `
//         function () {
//             var createProgressiveRandomGenerator = require('xydata').createProgressiveRandomGenerator
//             return createProgressiveRandomGenerator()
//                 .setNumberOfPoints(${pointCount + 1})
//                 .generate()
//                 .toPromise()
//         }`
// }
// /**
//  * Template factory for progressive Vec2 trace generation function.
//  */
// var GenerateProgressiveTrace = function (pointCount) {
//     return `
//         function () {
//             var createProgressiveTraceGenerator = require('xydata').createProgressiveTraceGenerator
//             return createProgressiveTraceGenerator()
//                 .setNumberOfPoints(${pointCount + 1})
//                 .generate()
//                 .toPromise()
//         }`
// }
// // TODO: Add scatter data generator to xydata?
// /**
//  * Template factory for random Vec2 generation function.
//  */
// var GenerateRandom = function (pointCount) {
//     return `
//         function () {
//             return new Promise(function (resolve, reject) {
//                 var points = []
//                 for (var i = 0; i < ${pointCount + 1}; i ++)
//                     points[i] = { x: Math.random(), y: Math.random() }
//                 resolve(points)
//             })
//         }`
// }
// /**
//  * Template factory for random Vec2 generation function.
//  */
// var GenerateOHLC = function (pointCount) {
//     return `
//         function () {
//             var createOHLCGenerator = require('xydata').createOHLCGenerator
//             return createOHLCGenerator()
//                 .setNumberOfPoints(${pointCount + 1})
//                 .generate()
//                 .toPromise()
//         }`
// }
// var scatterSeriesChunks = 10
// /**
//  * Template factory for scatter series perf test.
//  * Generates scatterSeriesChunks times the points requested and shuffles between them in chunks with size of 'pointCount'.
//  */
// var ScatterSeries = function (pointCount, pointSize, title) {
//     return ProtoTestCode(
//         `function() {
//             var lightningChart = require('lcjs').lightningChart
//             var chart = lightningChart(${licenseKey ? '\'' + licenseKey + '\'' : undefined})
//                 .ChartXY()
//                 .setTitle('${title}')
//                 .setMouseInteractions(false)

//             var axisX = chart.getDefaultAxisX()
//                 .setInterval(0, 1)
//                 .setScrollStrategy(undefined)
//                 .setMouseInteractions(false)
//             var axisY = chart.getDefaultAxisY()
//                 .setInterval(0, 1)
//                 .setScrollStrategy(undefined)
//                 .setMouseInteractions(false)

//             return chart
//         }
//         `,
//         GenerateRandom(pointCount * scatterSeriesChunks),
//         `
//         function (data, chart) {
//             var { PointShape } = require('lcjs').PointShape
//             var series = [
//                 chart.addPointSeries()
//                     .setPointSize(${pointSize})
//             ]
//             for (var i = 0; i < series.length; i++){
//                 var s = series[i]
//                 s
//                     .setCursorEnabled(false)
//                     .setPointFillStyleHighlight(s.getPointFillStyle())
//             }

//             return {
//                 data: data,
//                 series: series
//             }
//         }`, `
//         function (env) {
//             var data = env.data
//             var series = env.series
//             return new Promise(function (resolve, reject) {
//                 var tStart = window.performance.now()
//                 var c = 0
//                 var chunks = new Array(${scatterSeriesChunks})
//                 for (var i = 0; i < chunks.length; i ++)
//                     chunks[i] = data.slice(i * data.length / chunks.length, (i + 1) * data.length / chunks.length)
//                 var chunkIndex = 0
//                 var cycle = function(){ 
//                     var tNow = window.performance.now()
//                     if (tNow - tStart < testDuration) {
//                         chunkIndex = (++chunkIndex) < chunks.length ? chunkIndex : 0
//                         var chunk = chunks[chunkIndex]
//                         for (var i = 0; i < series.length; i++){
//                             series[i]
//                                 .clear()
//                                 .add(chunk)
//                         }
//                         window.requestAnimationFrame(cycle)
//                     }
//                     else
//                         resolve()
//                 }
//                 window.requestAnimationFrame(cycle)
//             })
//         }`
//     )
// }
// /**
//  * Template factory for scrolling progressive line series perf test.
//  */
// var ScrollingProgressiveLine = function (pointCount, seriesCount, thickness, title) {
//     return ProtoTestCode(
//         `function() {
//             var lightningChart = require('lcjs').lightningChart
//             var grid = lightningChart(${licenseKey ? '\'' + licenseKey + '\'' : undefined}).Dashboard(
//                 {
//                     numberOfColumns: 1,
//                     numberOfRows: ${seriesCount}
//                 })

//             return grid
//         }`,
//         GenerateProgressive(pointCount),
//         `
//         function (data, grid) {
//             var { AxisScrollStrategies, DataPatterns, emptyFill, emptyTick, AxisTickStrategies } = require('lcjs')
//             var series = []
//             for (var i = 0; i < ${seriesCount}; i ++) {
//                 var chart = grid.createChartXY({
//                     columnIndex:0, 
//                     rowIndex:i, 
//                     columnSpan:1, 
//                     rowSpan: 1
//                 })
//                     .setPadding({ bottom: 0, top: 0 })
//                     .setMouseInteractions(false)
//                 var axisX = chart.getDefaultAxisX()
//                     .setInterval(${-pointCount / 5}, 0)
//                     .setScrollStrategy(AxisScrollStrategies.progressive)
//                     .setMouseInteractions(false)
                
//                 var axisY = chart.getDefaultAxisY()
//                     .setInterval(0, 1)
//                     .setScrollStrategy(undefined)
//                     .setMouseInteractions(false)
//                 if (i < ${seriesCount - 1})
//                     axisX.setTickStrategy(AxisTickStrategies.Empty)
                
//                 if (i == 0)
//                     chart.setTitle('${title}')
//                 else
//                     chart.setTitleFillStyle(emptyFill)
//                     series.push(
//                     chart.addLineSeries({ dataPattern: DataPatterns.horizontalProgressive})
//                         .setStrokeStyle(function(style){return style.setThickness(${thickness})})
//                 )
//             }
//             for (var i = 0; i < series.length; i++){
//                 var s = series[i]
//                 s
//                     .setCursorEnabled(false)
//                     .setStrokeStyleHighlight(s.getStrokeStyle())
//             }
//             return {
//                 data: data,
//                 series: series
//             }
//         }`,
//         StreamData(true)
//     )
// }
// /**
//  * Template factory for static progressive line series perf test.
//  */
// var StaticProgressiveLine = function (pointCount, seriesCount, thickness, title) {
//     return ProtoTestCode(
//         `function() {
//             var lightningChart = require('lcjs').lightningChart
//             var grid = lightningChart(${licenseKey ? '\'' + licenseKey + '\'' : undefined}).Dashboard({
//                 numberOfColumns: 1,
//                 numberOfRows: ${seriesCount}
//             })

//             return grid
//         }`,
//         GenerateProgressive(pointCount),
//         `
//         function (data, grid) {
//             var { DataPatterns, emptyFill, emptyTick, AxisTickStrategies } = require('lcjs')
//             var series = []
//             for (var i = 0; i < ${seriesCount}; i ++) {
//                 var chart = grid.createChartXY({
//                     columnIndex:0, 
//                     rowIndex:i, 
//                     columnSpan:1, 
//                     rowSpan: 1
//                 })
//                     .setPadding({ bottom: 0, top: 0 })
//                     .setMouseInteractions(false)
//                 var axisX = chart.getDefaultAxisX()
//                     .setInterval(0, ${pointCount})
//                     .setScrollStrategy(undefined)
//                     .setMouseInteractions(false)
//                 var axisY = chart.getDefaultAxisY()
//                     .setInterval(0, 1)
//                     .setScrollStrategy(undefined)
//                     .setMouseInteractions(false)
//                 if (i < ${seriesCount - 1})
//                     axisX.setTickStrategy(AxisTickStrategies.Empty)
//                 if (i == 0)
//                     chart.setTitle('${title}')
//                 else
//                     chart.setTitleFillStyle(emptyFill)
                
//                 series.push(
//                     chart.addLineSeries({ dataPattern: DataPatterns.horizontalProgressive})
//                         .setStrokeStyle(function(style){return style.setThickness(${thickness})})
//                         .add(data)
//                 )
//             }
//             for (var i = 0; i < series.length; i++){
//                 var s = series[i]
//                 s
//                     .setCursorEnabled(false)
//                     .setStrokeStyleHighlight(s.getStrokeStyle())
//             }
//             return {
//                 data: data,
//                 series: series
//             }
//         }`, `
//         function (env) {
//             var data = env.data
//             var series = env.series
//             var relaxTime = Math.min(1000, testDuration * .2)
//             return new Promise(function (resolve, reject) {
//                 setTimeout(function(){ 
//                     var range = series[0].getXMax() - series[0].getXMin()
//                     var center = (series[0].getXMax() + series[0].getXMin()) / 2
//                     for (var i = 0; i < series.length; i++){
//                         series[i].axisX.setInterval(
//                             center - range * .005,
//                             center + range * .005,
//                             testDuration - relaxTime * 2
//                         )
//                     }
//                     setTimeout(function(){ 
//                         resolve()
//                     }, testDuration - relaxTime)
//                 }, relaxTime)
//             })
//         }`
//     )
// }
// /** 
//  * Template factory for scrolling point line series perf test.
//  * NOTE:    PointLineSeries is not optimized for progressive data yet, as it is always freeform.
//  *          Point counts should be considerably smaller than for ProgressiveLineSeries.
//  */
// var ScrollingPointLine = function (pointCount, seriesCount, title) {
//     return ProtoTestCode(
//         `function() {
//             var lightningChart = require('lcjs').lightningChart
//             var grid = lightningChart(${licenseKey ? '\'' + licenseKey + '\'' : undefined}).Dashboard({
//                 numberOfColumns: 1,
//                 numberOfRows: ${seriesCount}
//             })

//             return grid
//         }`,
//         GenerateProgressive(pointCount),
//         `
//         function (data, grid) {
//             var { AxisScrollStrategies, emptyFill, emptyTick, AxisTickStrategies } = require('lcjs')
//             var series = []
//             for (var i = 0; i < ${seriesCount}; i ++) {
//                 var chart = grid.createChartXY({
//                     columnIndex:0, 
//                     rowIndex:i, 
//                     columnSpan:1, 
//                     rowSpan: 1
//                 })
//                     .setPadding({ bottom: 0, top: 0 })
//                     .setMouseInteractions(false)
//                 var axisX = chart.getDefaultAxisX()
//                     .setInterval(${-pointCount / 5}, 0)
//                     .setScrollStrategy(AxisScrollStrategies.progressive)
//                     .setMouseInteractions(false)
//                 var axisY = chart.getDefaultAxisY()
//                     .setInterval(0, 1)
//                     .setScrollStrategy(undefined)
//                     .setMouseInteractions(false)
//                 if (i < ${seriesCount - 1})
//                     axisX.setTickStrategy(AxisTickStrategies.Empty)
                
//                 if (i == 0)
//                     chart.setTitle('${title}')
//                 else
//                     chart.setTitleFillStyle(emptyFill)
//                 series.push(chart.addPointLineSeries())
//             }
//             for (var i = 0; i < series.length; i++){
//                 var s = series[i]
//                 s
//                     .setCursorEnabled(false)
//                     .setPointFillStyle(s.getStrokeStyle().getFillStyle().getDefaultHighlightStyle())
//                     .setStrokeStyleHighlight(s.getStrokeStyle())
//                     .setPointFillStyleHighlight(s.getPointFillStyle())
//             }
//             return {
//                 data: data,
//                 series: series
//             }
//         }`,
//         StreamData(true)
//     )
// }
// /** 
//  * Template factory for spline series perf test.
//  */
// var SplineSeries = function (pointCount, seriesCount, title) {
//     return ProtoTestCode(
//         `function() {
//             var lightningChart = require('lcjs').lightningChart
//             var grid = lightningChart(${licenseKey ? '\'' + licenseKey + '\'' : undefined}).Dashboard({
//                 numberOfColumns: 1,
//                 numberOfRows: ${seriesCount}
//             })

//             return grid
//         }`,
//         GenerateProgressive(pointCount),
//         `
//         function (data, grid) {
//             var { AxisScrollStrategies, emptyFill, emptyTick, AxisTickStrategies } = require('lcjs')
//             var series = []
//             for (var i = 0; i < ${seriesCount}; i ++) {
//                 var chart = grid.createChartXY({
//                     columnIndex:0, 
//                     rowIndex:i, 
//                     columnSpan:1, 
//                     rowSpan: 1
//                 })
//                     .setPadding({ bottom: 0, top: 0 })
//                     .setMouseInteractions(false)
//                 var axisX = chart.getDefaultAxisX()
//                     .setInterval(${-pointCount / 5}, 0)
//                     .setScrollStrategy(AxisScrollStrategies.progressive)
//                     .setMouseInteractions(false)
//                 var axisY = chart.getDefaultAxisY()
//                     .setInterval(0, 1)
//                     .setScrollStrategy(undefined)
//                     .setMouseInteractions(false)
//                 if (i < ${seriesCount - 1})
//                     axisX.setTickStrategy(AxisTickStrategies.Empty)
                
//                 if (i == 0)
//                     chart.setTitle('${title}')
//                 else
//                     chart.setTitleFillStyle(emptyFill)
//                     series.push(
//                     chart.addSplineSeries()
//                 )
//             }
//             for (var i = 0; i < series.length; i++){
//                 var s = series[i]
//                 s
//                     .setCursorEnabled(false)
//                     .setPointFillStyle(s.getStrokeStyle().getFillStyle().getDefaultHighlightStyle())
//                     .setStrokeStyleHighlight(s.getStrokeStyle())
//                     .setPointFillStyleHighlight(s.getPointFillStyle())
//             }
//             return {
//                 data: data,
//                 series: series
//             }
//         }`,
//         StreamData(false)
//     )
// }
// /**
//  * Template factory for scrolling progressive area series perf test.
//  */
// var ScrollingProgressiveArea = function (pointCount, seriesCount, title) {
//     return ProtoTestCode(
//         `function() {
//             var lightningChart = require('lcjs').lightningChart
//             var grid = lightningChart(${licenseKey ? '\'' + licenseKey + '\'' : undefined}).Dashboard({
//                 numberOfColumns: 1,
//                 numberOfRows: ${seriesCount}
//             })

//             return grid
//         }`,
//         GenerateProgressive(pointCount),
//         `
//         function (data, grid) {
//             var { AxisScrollStrategies, emptyFill, emptyTick, AxisTickStrategies } = require('lcjs')
//             var series = []
//             for (var i = 0; i < ${seriesCount}; i ++) {
//                 var chart = grid.createChartXY({
//                     columnIndex:0, 
//                     rowIndex:i, 
//                     columnSpan:1, 
//                     rowSpan: 1
//                 })
//                     .setPadding({ bottom: 0, top: 0 })
//                     .setMouseInteractions(false)
//                 var axisX = chart.getDefaultAxisX()
//                     .setInterval(${-pointCount / 5}, 0)
//                     .setScrollStrategy(AxisScrollStrategies.progressive)
//                     .setMouseInteractions(false)
//                 var axisY = chart.getDefaultAxisY()
//                     .setInterval(0, 1)
//                     .setScrollStrategy(undefined)
//                     .setMouseInteractions(false)
//                 if (i < ${seriesCount - 1})
//                     axisX.setTickStrategy(AxisTickStrategies.Empty)
            
//                 if (i == 0)
//                     chart.setTitle('${title}')
//                 else
//                     chart.setTitleFillStyle(emptyFill)
                    
//                 series.push(chart.addAreaSeries())
//             }
//             for (var i = 0; i < series.length; i++){
//                 var s = series[i]
//                 s
//                     .setCursorEnabled(false)
//                     .setFillStyleHighlight(s.getFillStyle())
//                     .setStrokeStyleHighlight(s.getStrokeStyle())
//             }
//             return {
//                 data: data,
//                 series: series
//             }
//         }`,
//         StreamData(true)
//     )
// }
// /**
//  * Template factory for OHLC series perf test.
//  */
// var OHLCSeries = function (pointCount, generator, ohlcSeriesType, ohlcFigureType, title) {
//     return ProtoTestCode(
//         `function() {
//             var lightningChart = require('lcjs').lightningChart
//             var chart = lightningChart(${licenseKey ? '\'' + licenseKey + '\'' : undefined}).ChartXY()

//             return chart
//         }`,
//         generator(pointCount),
//         `
//         function (data, chart) {
//             var { OHLCSeriesTypes, OHLCFigures } = require('lcjs')
//             chart
//                 .setTitle('${title}')
//                 .setMouseInteractions(false)
//             chart.getDefaultAxisX()
//                 .setInterval(0, ${pointCount})
//                 .setScrollStrategy(undefined)
//                 .setMouseInteractions(false)
//             chart.getDefaultAxisY()
//                 .setAnimationScroll(undefined)
//                 .setMouseInteractions(false)
//             var series = [
//                 chart.addOHLCSeries({
//                     positiveFigure : OHLCFigures['${ohlcFigureType}'],
//                     seriesConstructor : OHLCSeriesTypes['${ohlcSeriesType}']
//                 })
//             ]
//             for (var i = 0; i < series.length; i++){
//                 var s = series[i]
//                 s
//                     .setCursorEnabled(false)
//                     .setStyle(function(figure){ 
//                         if ('${ohlcFigureType}' == 'Candlesticks') {
//                             figure
//                                 .setBodyFillStyleHighlight(figure.getBodyFillStyle())
//                                 .setBodyStrokeStyleHighlight(figure.getBodyStrokeStyle())
//                                 .setStrokeStyleHighlight(figure.getStrokeStyle())
//                         }
//                         else if ('${ohlcFigureType}' == 'Bar')
//                             figure
//                                 .setStrokeStyleHighlight(figure.getStrokeStyle())
//                     })
//             }
//             return {
//                 data: data,
//                 series: series
//             }
//         }`,
//         StreamData()
//     )
// }
// var OHLCSeriesFit = function (pointCount, generator, ohlcSeriesType, ohlcFigureType, title) {
//     return ProtoTestCode(
//         `function() {
//             var lightningChart = require('lcjs').lightningChart
//             var chart = lightningChart(${licenseKey ? '\'' + licenseKey + '\'' : undefined}).ChartXY()

//             return chart
//         }`,
//         generator(pointCount),
//         `
//         function (data, chart) {
//             var { OHLCSeriesTypes, OHLCFigures } = require('lcjs')
//             chart
//                 .setTitle('${title}')
//                 .setMouseInteractions(false)
//             var range = ${pointCount}
//             var center = ${pointCount} * .5
//             chart.getDefaultAxisX()
//                 .setInterval(
//                     center - range * .005,
//                     center + range * .005
//                 )
//                 .setScrollStrategy(undefined)
//                 .setMouseInteractions(false)
            
//             chart.getDefaultAxisY()
//                 .setAnimationScroll(undefined)
//                 .setMouseInteractions(false)
//             var series = [
//                 chart.addOHLCSeries({
//                     positiveFigure : OHLCFigures['${ohlcFigureType}'],
//                     seriesConstructor : OHLCSeriesTypes['${ohlcSeriesType}']
//                 })
//                     .add(data)
//             ]
//             for (var i = 0; i < series.length; i++){
//                 var s = series[i]
//                 s
//                     .setCursorEnabled(false)
//                     .setStyle(function(figure){ 
//                         if ('${ohlcFigureType}' == 'Candlesticks') {
//                             figure
//                                 .setBodyFillStyleHighlight(figure.getBodyFillStyle())
//                                 .setBodyStrokeStyleHighlight(figure.getBodyStrokeStyle())
//                                 .setStrokeStyleHighlight(figure.getStrokeStyle())
//                         }
//                         else if ('${ohlcFigureType}' == 'Bar')
//                             figure
//                                 .setStrokeStyleHighlight(figure.getStrokeStyle())
//                     })
//             }
//             return {
//                 data:data,
//                 series:series
//             }
//         }`, `
//         function (env) {
//             var data = env.data
//             var series = env.series
//             var relaxTime = Math.min(1000, testDuration * .2)
//             return new Promise(function (resolve, reject) {
//                 setTimeout(function(figure){ 
//                     for (var i = 0; i < series.length; i++){
//                         var s = series[i]
//                         s.axisX.fit(
//                             testDuration - relaxTime * 2
//                         )
//                     }
//                     setTimeout(function(){ 
//                         resolve()
//                     }, testDuration - relaxTime)
//                 }, relaxTime)
//             })
//         }`
//     )
// }

// // Create test content (XY).
// var xy = Group({
//     key: 'xy',
//     label: 'XY',
//     defaultCollapsed: true
// })

// // ----- Scatter Series -----
// //#region
// var scatterSeries = xy.Group({
//     key: 'scatterSeries',
//     label: 'Scatter Series'
// })
// var addScatterSeries = (pointSize) =>
//     scatterSeries.Group({
//         key: `${pointSize}px`,
//         label: `${pointSize} pixels`
//     })
//         .Test({
//             key: '1k',
//             label: '1 k points',
//             code: ScatterSeries(1000 * 1, pointSize, `Scatter Series 1 000 points ${pointSize}px ${scatterSeriesChunks} sets`)
//         })
//         .Test({
//             key: '10k',
//             label: '10 k points',
//             code: ScatterSeries(1000 * 10, pointSize, `Scatter Series 10 000 points ${pointSize}px ${scatterSeriesChunks} sets`)
//         })
//         .Test({
//             key: '50k',
//             label: '50 k points',
//             code: ScatterSeries(1000 * 50, pointSize, `Scatter Series 50 000 points ${pointSize}px ${scatterSeriesChunks} sets`),
//             defaultSelected: false
//         })
//         .Test({
//             key: '100k',
//             label: '100 k points',
//             code: ScatterSeries(1000 * 100, pointSize, `Scatter Series 100 000 points ${pointSize}px ${scatterSeriesChunks} sets`),
//             defaultSelected: false
//         });
// [1, 7].map(addScatterSeries)
// //#endregion

// // ----- Scrolling Line Series -----
// //#region
// var scrollingLineSeries = xy.Group({
//     key: 'scrollingLineSeries',
//     label: 'Scrolling Line Series'
// })
// var addScrollingLineSeries = (seriesCount, defaultSelected, excludeAmount = 0) => {
//     var group = scrollingLineSeries.Group({
//         key: `${seriesCount}xSeries`,
//         label: `${seriesCount} Series`,
//         defaultSelected
//     })
//     var thicknessList = [{
//         key: 'thin',
//         label: 'Thin line',
//         thickness: 1
//     },
//     {
//         key: 'thick',
//         label: 'Thick line',
//         thickness: 4
//     }
//     ]
//     var paramsList = [{
//         key: '1k',
//         label: '1 k points',
//         code: (thickness) => ScrollingProgressiveLine(1000 * 1, seriesCount, thickness.thickness, `${seriesCount} Scrolling Line Series 1 000 points each ${thickness.label}`)
//     },
//     {
//         key: '10k',
//         label: '10 k points',
//         code: (thickness) => ScrollingProgressiveLine(1000 * 10, seriesCount, thickness.thickness, `${seriesCount} Scrolling Line Series 10 000 points each ${thickness.label}`)
//     },
//     {
//         key: '100k',
//         label: '100 k points',
//         code: (thickness) => ScrollingProgressiveLine(1000 * 100, seriesCount, thickness.thickness, `${seriesCount} Scrolling Line Series 100 000 points each ${thickness.label}`)
//     },
//     {
//         key: '1M',
//         label: '1 M points',
//         code: (thickness) => ScrollingProgressiveLine(1000 * 1000, seriesCount, thickness.thickness, `${seriesCount} Scrolling Line Series 1 000 000 points each ${thickness.label}`)
//     },
//     {
//         key: '10M',
//         label: '10 M points',
//         code: (thickness) => ScrollingProgressiveLine(10 * 1000 * 1000, seriesCount, thickness.thickness, `${seriesCount} Scrolling Line Series 10 000 000 points each ${thickness.label}`),
//         defaultSelected: false
//     }
//     ]
//     for (let thicknessParams of thicknessList) {
//         var thicknessGroup = group.Group(thicknessParams)
//         for (let i = 0; i < paramsList.length - excludeAmount; i++)
//             thicknessGroup.Test({
//                 key: paramsList[i].key,
//                 label: paramsList[i].label,
//                 code: paramsList[i].code(thicknessParams),
//                 defaultSelected: paramsList[i].defaultSelected
//             })
//     }
// }
// addScrollingLineSeries(1, true)
// addScrollingLineSeries(5, false, 1)
// addScrollingLineSeries(10, false, 1)

// //#endregion

// // ----- Static Line Series -----
// //#region
// var staticLineSeries = xy.Group({
//     key: 'staticLineSeries',
//     label: 'Static Line Series'
// })
// var addStaticLineSeries = (seriesCount, defaultSelected, excludeAmount = 0) => {
//     var group = staticLineSeries.Group({
//         key: `${seriesCount}xSeries`,
//         label: `${seriesCount} Series`,
//         defaultSelected
//     })
//     var thicknessList = [{
//         key: 'thin',
//         label: 'Thin line',
//         thickness: 1
//     },
//     {
//         key: 'thick',
//         label: 'Thick line',
//         thickness: 4
//     }
//     ]
//     var paramsList = [{
//         key: '1k',
//         label: '1 k points',
//         code: (thickness) => StaticProgressiveLine(1000 * 1, seriesCount, thickness.thickness, `${seriesCount} Static Line Series 1 000 points each ${thickness.label}`)
//     },
//     {
//         key: '10k',
//         label: '10 k points',
//         code: (thickness) => StaticProgressiveLine(1000 * 10, seriesCount, thickness.thickness, `${seriesCount} Static Line Series 10 000 points each ${thickness.label}`)
//     },
//     {
//         key: '100k',
//         label: '100 k points',
//         code: (thickness) => StaticProgressiveLine(1000 * 100, seriesCount, thickness.thickness, `${seriesCount} Static Line Series 100 000 points each ${thickness.label}`)
//     },
//     {
//         key: '1M',
//         label: '1 M points',
//         code: (thickness) => StaticProgressiveLine(1000 * 1000, seriesCount, thickness.thickness, `${seriesCount} Static Line Series 1 000 000 points each ${thickness.label}`)
//     },
//     {
//         key: '10M',
//         label: '10 M points',
//         code: (thickness) => StaticProgressiveLine(10 * 1000 * 1000, seriesCount, thickness.thickness, `${seriesCount} Static Line Series 10 000 000 points each ${thickness.label}`),
//         defaultSelected: false
//     }
//     ]
//     for (let thicknessParams of thicknessList) {
//         var thicknessGroup = group.Group(thicknessParams)
//         for (let i = 0; i < paramsList.length - excludeAmount; i++)
//             thicknessGroup.Test({
//                 key: paramsList[i].key,
//                 label: paramsList[i].label,
//                 code: paramsList[i].code(thicknessParams),
//                 defaultSelected: paramsList[i].defaultSelected
//             })
//     }
// }
// addStaticLineSeries(1, true)
// // Exclude 10 M test for multiple series.
// addStaticLineSeries(5, false, 1)
// addStaticLineSeries(10, false, 1)

// //#endregion

// // ----- Scrolling Area Series -----
// //#region
// var scrollingAreaSeries = xy.Group({
//     key: 'scrollingAreaSeries',
//     label: 'Scrolling Area Series'
// })
// var addScrollingAreaSeries = (seriesCount, defaultSelected, excludeAmount = 0) => {
//     var group = scrollingAreaSeries.Group({
//         key: `${seriesCount}xSeries`,
//         label: `${seriesCount} Series`,
//         defaultSelected
//     })
//     var paramsList = [{
//         key: '1k',
//         label: '1 k points',
//         code: ScrollingProgressiveArea(1000 * 1, seriesCount, `${seriesCount} Scrolling Area Series 1 000 points each`)
//     },
//     {
//         key: '10k',
//         label: '10 k points',
//         code: ScrollingProgressiveArea(1000 * 10, seriesCount, `${seriesCount} Scrolling Area Series 10 000 points each`)
//     },
//     {
//         key: '100k',
//         label: '100 k points',
//         code: ScrollingProgressiveArea(1000 * 100, seriesCount, `${seriesCount} Scrolling Area Series 100 000 points each`)
//     },
//     {
//         key: '1M',
//         label: '1 M points',
//         code: ScrollingProgressiveArea(1000 * 1000, seriesCount, `${seriesCount} Scrolling Area Series 1 000 000 points each`),
//         defaultSelected: false
//     }
//     ]
//     for (let i = 0; i < paramsList.length - excludeAmount; i++)
//         group.Test(paramsList[i])
// }
// addScrollingAreaSeries(1)
// // Exclude 1 M test for multiple series.
// addScrollingAreaSeries(5, false, 1)

// //#endregion

// // ----- Point Line Series -----
// //#region
// var scrollingPointLineSeries = xy.Group({
//     key: 'scrollingPointLineSeries',
//     label: 'Scrolling Point Line Series'
// })
// var addScrollingPointLineSeries = (seriesCount, defaultSelected, excludeAmount = 0) => {
//     var group = scrollingPointLineSeries.Group({
//         key: `${seriesCount}xSeries`,
//         label: `${seriesCount} Series`,
//         defaultSelected
//     })
//     var paramsList = [{
//         key: '1k',
//         label: '1 k points',
//         code: ScrollingPointLine(1000 * 1, seriesCount, `${seriesCount} Scrolling Point Line Series 1 000 points each`)
//     },
//     {
//         key: '10k',
//         label: '10 k points',
//         code: ScrollingPointLine(1000 * 10, seriesCount, `${seriesCount} Scrolling Point Line Series 10 000 points each`)
//     },
//     {
//         key: '100k',
//         label: '100 k points',
//         code: ScrollingPointLine(1000 * 100, seriesCount, `${seriesCount} Scrolling Point Line Series 100 000 points each`)
//     },
//     {
//         key: '1M',
//         label: '1 M points',
//         code: ScrollingPointLine(1000 * 1000, seriesCount, `${seriesCount} Scrolling Point Line Series 1 000 000 points each`),
//         defaultSelected: false
//     }
//     ]
//     for (let i = 0; i < paramsList.length - excludeAmount; i++)
//         group.Test(paramsList[i])
// }
// addScrollingPointLineSeries(1, true)
// // Exclude 1 M test for multiple series.
// addScrollingPointLineSeries(5, false, 1)

// //#endregion

// // ----- Spline Series -----

// //#region
// var splineSeries = xy.Group({
//     key: 'splineSeries',
//     label: 'Spline Series'
// })
// var addSplineSeries = (seriesCount, defaultSelected, excludeAmount = 0) => {
//     var group = splineSeries.Group({
//         key: `${seriesCount}xSeries`,
//         label: `${seriesCount} Series`,
//         defaultSelected
//     })
//     var paramsList = [{
//         key: '100',
//         label: '100 points',
//         code: SplineSeries(100, seriesCount, `${seriesCount} Spline Series 100 points each`)
//     },
//     {
//         key: '1k',
//         label: '1 k points',
//         code: SplineSeries(1000 * 1, seriesCount, `${seriesCount} Spline Series 1 000 points each`)
//     },
//     {
//         key: '10k',
//         label: '10 k points',
//         code: SplineSeries(1000 * 10, seriesCount, `${seriesCount} Spline Series 10 000 points each`),
//         defaultSelected: false
//     }
//     ]
//     for (let i = 0; i < paramsList.length - excludeAmount; i++)
//         group.Test(paramsList[i])
// }
// addSplineSeries(1, true)
// addSplineSeries(5, false)

// //#endregion

// // ----- OHLC Series -----
// //#region
// var ohlcSeries = xy.Group({
//     key: 'ohlc',
//     label: 'OHLC Series'
// })
// var createOHLCSeriesTests = (factory) => {
//     factory({
//         key: 'candlesticks',
//         label: 'Candlesticks'
//     },
//         'Candlesticks'
//     )
// }
// createOHLCSeriesTests(
//     (groupParams, figureType) => ohlcSeries.Group({
//         key: 'ohlcInput',
//         label: 'OHLC Input'
//     })
//         .Group(groupParams)
//         .Test({
//             key: '100',
//             label: '100 records',
//             code: OHLCSeries(100, GenerateOHLC, 'Normal', figureType, `OHLC Series ${figureType} 100 records`)
//         })
//         .Test({
//             key: '1k',
//             label: '1 k records',
//             code: OHLCSeries(1000, GenerateOHLC, 'Normal', figureType, `OHLC Series ${figureType} 1 000 records`)
//         })
//         .Test({
//             key: '10k',
//             label: '10 k records',
//             code: OHLCSeries(1000 * 10, GenerateOHLC, 'Normal', figureType, `OHLC Series ${figureType} 10 000 records`)
//         })
//         .Test({
//             key: '100k',
//             label: '100 k records',
//             code: OHLCSeries(1000 * 100, GenerateOHLC, 'Normal', figureType, `OHLC Series ${figureType} 100 000 records`),
//             defaultSelected: false
//         })
//         .Test({
//             key: '1M',
//             label: '1 M records',
//             code: OHLCSeries(1000 * 1000, GenerateOHLC, 'Normal', figureType, `OHLC Series ${figureType} 1 000 000 records`),
//             defaultSelected: false
//         })
// )
// createOHLCSeriesTests(
//     (groupParams, figureType) => ohlcSeries.Group({
//         key: 'xyInput',
//         label: 'XY Input'
//     })
//         .Group(groupParams)
//         .Test({
//             key: '100',
//             label: '100 points',
//             code: OHLCSeries(100, GenerateProgressiveTrace, 'AutomaticPacking', figureType, `OHLC Series XY-input ${figureType} 100 points`)
//         })
//         .Test({
//             key: '1k',
//             label: '1 k points',
//             code: OHLCSeries(1000, GenerateProgressiveTrace, 'AutomaticPacking', figureType, `OHLC Series XY-input ${figureType} 1 000 points`)
//         })
//         .Test({
//             key: '10k',
//             label: '10 k points',
//             code: OHLCSeries(1000 * 10, GenerateProgressiveTrace, 'AutomaticPacking', figureType, `OHLC Series XY-input ${figureType} 10 000 points`)
//         })
//         .Test({
//             key: '100k',
//             label: '100 k points',
//             code: OHLCSeries(1000 * 100, GenerateProgressiveTrace, 'AutomaticPacking', figureType, `OHLC Series XY-input ${figureType} 100 000 points`)
//         })
//         .Test({
//             key: '1M',
//             label: '1 M points',
//             code: OHLCSeries(1000 * 1000, GenerateProgressiveTrace, 'AutomaticPacking', figureType, `OHLC Series XY-input ${figureType} 1 000 000 points`),
//             defaultSelected: false
//         })
//         .Test({
//             key: '10M',
//             label: '10 M points',
//             code: OHLCSeries(10 * 1000 * 1000, GenerateProgressiveTrace, 'AutomaticPacking', figureType, `OHLC Series XY-input ${figureType} 10 000 000 points`),
//             defaultSelected: false
//         })
// )
// createOHLCSeriesTests(
//     (groupParams, figureType) => ohlcSeries.Group({
//         key: 'fitData',
//         label: 'Fit Data'
//     })
//         .Group(groupParams)
//         .Test({
//             key: '100',
//             label: '100 records',
//             code: OHLCSeriesFit(100, GenerateOHLC, 'Normal', figureType, `OHLC Series Fit-data ${figureType} 100 records`)
//         })
//         .Test({
//             key: '1k',
//             label: '1 k records',
//             code: OHLCSeriesFit(1000, GenerateOHLC, 'Normal', figureType, `OHLC Series Fit-data ${figureType} 1 000 records`)
//         })
//         .Test({
//             key: '10k',
//             label: '10 k records',
//             code: OHLCSeriesFit(1000 * 10, GenerateOHLC, 'Normal', figureType, `OHLC Series Fit-data ${figureType} 10 000 records`)
//         })
//         .Test({
//             key: '100k',
//             label: '100 k records',
//             code: OHLCSeriesFit(1000 * 100, GenerateOHLC, 'Normal', figureType, `OHLC Series Fit-data ${figureType} 100 000 records`),
//             defaultSelected: false
//         })
//         .Test({
//             key: '1M',
//             label: '1 M records',
//             code: OHLCSeriesFit(1000 * 1000, GenerateOHLC, 'Normal', figureType, `OHLC Series Fit-data ${figureType} 1 000 000 records`),
//             defaultSelected: false
//         })
// )
// //#endregion



// // ----- Create Dashboard tests -----
// var Dashboard = function (numberOfRows, numberOfColumns, moveSplitters, title) {
//     return ProtoTestCode(
//         `function() {
//             var lightningChart = require('lcjs').lightningChart
//             var dashboard = lightningChart(${licenseKey ? '\'' + licenseKey + '\'' : undefined}).Dashboard({
//                 numberOfRows: ${numberOfRows},
//                 numberOfColumns: ${numberOfColumns}
//             })
            
//             return dashboard
//         }`,
//         GenerateProgressiveTrace(100),
//         `
//         function (data, dashboard) {
//             var { DataPatterns, emptyFill } = require('lcjs')
//             var charts = []
//             var series = []
//             for (var x = 0; x < ${numberOfColumns}; x ++) {
//                 charts[x] = []
//                 for (var y = 0; y < ${numberOfRows}; y ++) {
//                     var chart = dashboard.createChartXY({
//                         columnIndex:x, 
//                         rowIndex:y, 
//                         columnSpan:1, 
//                         rowSpan: 1
//                     })
//                         .setPadding({ bottom: 0, top: 0 })
//                         .setMouseInteractions(false)
//                     var s =  chart.addLineSeries({ dataPattern: DataPatterns.horizontalProgressive})
//                         .setStrokeStyle(function(style){return style.setThickness(1)})
//                         .add(data)
//                     chart.getDefaultAxisX()
//                         .setMouseInteractions(false)
//                         .setScrollStrategy(undefined)
//                         .fit()
//                     chart.getDefaultAxisY()
//                         .setMouseInteractions(false)
//                         .setScrollStrategy(undefined)
//                         .fit()
//                     if (y == 0 && x == 0)
//                         chart.setTitle('${title}')
//                     else
//                         chart.setTitleFillStyle(emptyFill)
//                     charts[x][y] = chart
//                     series.push(s)
//                 }
//             }
//             for (var i = 0; i < series.length; i++){
//                 var s = series[i]
//                 s
//                     .setCursorEnabled(false)
//                     .setStrokeStyleHighlight(s.getStrokeStyle())
//             }
//             return {
//                 engine: dashboard.engine,
//                 dashboard: dashboard,
//                 charts: charts,
//                 series: series
//             }
//         }`,
//         `
//         function (env) {
//             var lcjs = require('lcjs')
//             var translatePoint = lcjs.translatePoint
//             var dashboard = env.dashboard
//             var charts = env.charts
//             return new Promise(function (resolve, reject) {
//                 if (${moveSplitters}) {
//                     // Define tool for programmatically triggering mouse-events, at precise locations in order to move dashboard splitters.
//                     var moveSplitter = (function(_element){
//                         // The position along splitters where splitters are dragged. (hardcoded with a value that would drag the right splitters)
//                         var splitterDragPosition = 15
//                         var _simulateMouse = function(type, x, y){
//                             var event = new PointerEvent(type, {
//                                 view: window,
//                                 bubbles: true,
//                                 cancelable: true,
//                                 clientX: x,
//                                 clientY: y,
//                                 button: 0
//                             })
//                             _element.dispatchEvent(event)
//                         }
//                         var _either = function(maybe, otherwise){return maybe !== undefined ? maybe : otherwise}
//                         /**
//                          * Function which moves a splitter.
//                          * @param   panel       Dashboard Panel.
//                          * @param   side        Splitter side [ 'top', 'right', 'bottom', 'left' ]
//                          * @param   vector      Movement vector
//                          * @param   duration    Movement duration in milliseconds
//                          * @return              Sub method for callback
//                          */
//                         return function(panel, side, vector, duration){
//                             if(!duration){
//                                 duration = 1000
//                             }
//                             // Subs.
//                             var callbacks = []
//                             // Decide splitterPosition on panel scale based on side.
//                             var splitterPositionPanel
//                             switch (side) {
//                                 case 'top':
//                                     splitterPositionPanel = { x: splitterDragPosition, y: 100 + 5 * panel.uiScale.y.getPixelSize() }
//                                     break
//                                 case 'right':
//                                     splitterPositionPanel = { x: 100 + 5 * panel.uiScale.x.getPixelSize(), y: splitterDragPosition }
//                                     break
//                                 case 'bottom':
//                                     splitterPositionPanel = { x: splitterDragPosition, y: 0 - 5 * panel.uiScale.y.getPixelSize() }
//                                     break
//                                 case 'left':
//                                     splitterPositionPanel = { x: 0 - 5 * panel.uiScale.x.getPixelSize(), y: splitterDragPosition }
//                                     break
//                             }
//                             // Find position of splitter on panel.
//                             var posInEngine = translatePoint(splitterPositionPanel, panel.uiScale, panel.engine.scale)
//                             var splitterPosition = panel.engine.engineLocation2Client(posInEngine.x, posInEngine.y)
//                             var targetPosition = { x: splitterPosition.x + _either(vector.x, 0), y: splitterPosition.y + _either(vector.y, 0) }
//                             // Simulate mouse move and down.
//                             _simulateMouse('pointermove', splitterPosition.x, splitterPosition.y)
//                             _simulateMouse('pointerdown', splitterPosition.x, splitterPosition.y)
//                             // Set animation for movement.
//                             var pos = 0
//                             var tPrev = window.performance.now()
//                             var sub = setInterval(function() {
//                                 var tNow = window.performance.now()
//                                 var tDelta = tNow - tPrev
//                                 // Increment animated position.
//                                 pos = Math.min(pos + tDelta / duration, 1.0)
//                                 // Compute current mouse position.
//                                 var curPosition = {
//                                     x: splitterPosition.x + pos * (targetPosition.x - splitterPosition.x),
//                                     y: splitterPosition.y + pos * (targetPosition.y - splitterPosition.y)
//                                 }
//                                 // Move mouse.
//                                 _simulateMouse('pointermove', curPosition.x, curPosition.y)
//                                 // Check end of animation.
//                                 if (pos >= 1) {
//                                     clearInterval(sub)
//                                     _simulateMouse('pointerup', curPosition.x, curPosition.y)
//                                     _simulateMouse('pointermove', 0, 0)
//                                     for (var i = 0; i < callbacks.length; i++){
//                                         callbacks[i]()
//                                     }
//                                 }
//                                 tPrev = tNow
//                             }, 32)
//                             // Return callback.
//                             return function(clbk) {return callbacks.push(clbk)}
//                         }
//                     })(dashboard.engine.container);
    
//                     var interval = testDuration / ( 2 + 4 * 2 )
//                     var moveAmount = 100
//                     var moves = [
//                         function(){return moveSplitter(charts[0][0], 'bottom', { y: moveAmount }, interval)},
//                         function(){return moveSplitter(charts[${numberOfColumns - 1}][0], 'left', { x: -moveAmount }, interval)},
//                         function(){return moveSplitter(charts[0][${numberOfRows - 1}], 'top', { y: -moveAmount }, interval)},
//                         function(){return moveSplitter(charts[0][0], 'right', { x: moveAmount }, interval)}
//                     ]
//                     setTimeout(
//                         function() {
//                             var queue = function(i){
//                                 var makeCallback = moves[i]()
//                                 makeCallback(
//                                     i < moves.length - 1 ?
//                                         function(){return setTimeout(function(){return queue(i + 1)}, interval)} :
//                                         function(){return setTimeout(resolve, interval)}
//                                 )
//                             }
//                             queue(0)
//                         },
//                         interval
//                     )
//                 } else {
//                     setTimeout(resolve, testDuration)
//                 }
//             })
//         }`
//     )
// }
// var tests3D = Group({
//     key: 'dashboard',
//     label: 'Dashboard'
// })
// tests3D
//     .Test({
//         key: '2x2',
//         label: '2x2',
//         code: Dashboard(2, 2, true, `Resizing Dashboard 2x2`)
//     })
//     .Test({
//         key: '2x4',
//         label: '2x4',
//         code: Dashboard(2, 4, true, `Resizing Dashboard 2x4`)
//     })
//     .Test({
//         key: '3x3',
//         label: '3x3',
//         code: Dashboard(3, 3, true, `Resizing Dashboard 3x3`)
//     })
//     .Test({
//         key: '5x5',
//         label: '5x5',
//         code: Dashboard(5, 5, true, `Resizing Dashboard 5x5`)
//     })
