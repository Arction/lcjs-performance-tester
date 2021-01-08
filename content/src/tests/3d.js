// 3D tests
// Everything defined in tools.js is usable here.

var tests3D = Group({
    key: '3d',
    label: '3D'
})
tests3D
    .Test({
        key: 'test',
        label: 'test',
        defaultSelected: false,
        code: ProtoTestCode(
            `function() {
                console.log('1')
                var lightningChart = require('lcjs').lightningChart
                var chart3D = lightningChart().Chart3D()
                return chart3D
            }`,
            `function() {
                console.log('2')
                return new Promise(function (resolve, reject) {
                    resolve([])
                })
            }`,
            `function (data, chart) {
                console.log('3')
            }`,
            `function (env) {
                return new Promise(function (resolve, reject) {
                    console.log('4')
                })
            }`
        )
    })

var locateChart3D = `function() {
    var lightningChart = require('lcjs').lightningChart
    var chart = lightningChart().Chart3D()
    chart.setCameraLocation({x: 1.0489653067913933, y: 0.5640370604112517, z: 0.5555008268409382})
    return chart
}`

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
            defaultSelected: false,
            key: 'pointSeries3D cube',
            label: 'Point Series 3D \'cube\'',
            pointAmounts: [
                10 * 1000,
                100 * 1000,
                1000 * 1000
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
            defaultSelected: false,
            key: 'pointCloudSeries3D',
            label: 'Point Cloud Series 3D',
            pointAmounts: [
                10 * 1000,
                100 * 1000,
                1000 * 1000
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
            defaultSelected: false,
            key: 'lineSeries3D',
            label: 'Line Series 3D',
            pointAmounts: [
                10 * 1000,
                100 * 1000
            ],
            generator: generateTraceData3D,
            initSeries: `
                var series = chart.addLineSeries()
                    .setLineStyle(function (style) {
                        var lineThickness = Math.max(1, Math.round( 14 - 2 * Math.log10( data.length ) ))
                        return style.setThickness(lineThickness)
                    })
                `
        },
        {
            defaultSelected: true,
            key: 'pointLineSeries3D sphere',
            label: 'Point Line Series 3D \'sphere\'',
            pointAmounts: [
                10 * 1000,
                100 * 1000
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
        var groupStatic = group.Group({
            key: 'static',
            label: 'Static'
        })
        var groupRealtime = group.Group({
            key: 'realtime',
            label: 'Realtime'
        })
        for (var pointAmount of groupInfo.pointAmounts) {
            groupStatic.Test({
                key: `${pointAmount/1000} k`,
                label: `${pointAmount/1000} k points`,
                code: ProtoTestCode(
                    locateChart3D,
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
                key: `${pointAmount/1000} k`,
                label: `${pointAmount/1000} k points`,
                code: ProtoTestCode(
                    locateChart3D,
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
                    StreamData(false)
                )
            })
        }
    }
})()

// #endregion