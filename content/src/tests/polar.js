// Polar charts tests
// Everything defined in tools.js is usable here.

var testsPolar = Group({
    key: 'Polar',
    label: 'Polar'
})

var locatePolarChart = function (conf) {
    var title = conf && conf.title ? conf.title : ''
    return `function() {
        var { lightningChart, AutoCursorModes } = require('lcjs')
        var chart = lightningChart().Polar()
            .setTitle("${title}")
            .setAutoCursorMode(AutoCursorModes.disabled)
        chart.getAmplitudeAxis()
            .setAnimationScroll(undefined)
        return chart
    }`
}

    // ----- Shared test suite for following Polar series types: -----
    // - Polar Point Series
    // - Polar Line Series
    // - Polar Point & Line Series
    // - Polar Area Series (interior)
    // #region

    ; (function () {

        var generatePolarData = function (channelsCount, pointsPerCh) {
            return `function () {
            return new Promise(function (resolve, reject) {
                const timeDomainDepth = 10
                const angleStep = 360 / ${pointsPerCh}
                var dataSets = []
                for (var iCh = 0; iCh < ${channelsCount}; iCh += 1) {
                    const chDataSet = new Array(timeDomainDepth).fill(undefined).map(_ => [])
                    dataSets.push(chDataSet)
                    const chAmplitudeMax = 100 - (iCh / ${channelsCount}) * 100
                    const chAmplitudeMin = chAmplitudeMax * 0.90
                    for (var angle = 0; angle < 360; angle += angleStep) {
                        const amplitude = chAmplitudeMin + Math.random() * (chAmplitudeMax - chAmplitudeMin)
                        chDataSet[0].push({ angle, amplitude })
                        for (let iTimeDomain = 1; iTimeDomain < timeDomainDepth; iTimeDomain += 1) {
                            chDataSet[iTimeDomain].push({ angle, amplitude: amplitude + (Math.random() * 2 - 1) * 3.0 })
                        }
                    }
                }
                resolve(dataSets)
            })
        }`
        }

        var groupsInfo = [
            {
                key: 'polarLineSeries',
                label: 'Polar Line Series',
                featureName: 'Polar Line Series',
                channelCounts: [
                    1,
                    5,
                    10,
                ],
                pointsPerCh: [
                    360,
                    3600
                ],
                defaultSelected: ({ channelsCount, pointsPerCh }) => false,
                initSeries: `function (iCh, channelsCount) {
                var { SolidLine, SolidFill, ColorHSV } = require('lcjs')
                return chart.addLineSeries()
                    .setStrokeStyle(new SolidLine({ thickness: 1, fillStyle: new SolidFill({ color: ColorHSV( 360 * iCh / channelsCount ) }) }))
                    .setConnectDataAutomaticallyEnabled(true)
            }`
            },
            {
                key: 'polarPointSeries',
                label: 'Polar Point Series',
                featureName: 'Polar Point Series',
                channelCounts: [
                    1,
                    5,
                    10,
                ],
                pointsPerCh: [
                    360,
                    3600
                ],
                defaultSelected: ({ channelsCount, pointsPerCh }) => false,
                initSeries: `function (iCh, channelsCount) {
                var { SolidFill, ColorHSV } = require('lcjs')
                return chart.addPointSeries()
                    .setPointFillStyle(new SolidFill({ color: ColorHSV( 360 * iCh / channelsCount ) }))
            }`
            },
            {
                key: 'polarPointLineSeries',
                label: 'Polar Point Line Series',
                featureName: 'Polar Point Line Series',
                channelCounts: [
                    1,
                    5,
                    10,
                ],
                pointsPerCh: [
                    360,
                    3600
                ],
                defaultSelected: ({ channelsCount, pointsPerCh }) => false,
                initSeries: `function (iCh, channelsCount) {
                var { SolidLine, SolidFill, ColorHSV, ColorHEX } = require('lcjs')
                return chart.addPointLineSeries()
                    .setStrokeStyle(new SolidLine({
                        thickness: 1,
                        fillStyle: new SolidFill({
                            color: ColorHSV( 360 * iCh / channelsCount )
                        })
                    }))
                    .setPointFillStyle(new SolidFill({ color: ColorHEX('#fff') }))
                    .setConnectDataAutomaticallyEnabled(true)
            }`
            },
            {
                key: 'polarAreaSeries',
                label: 'Polar Area Series',
                featureName: 'Polar Area Series',
                channelCounts: [
                    1,
                    5,
                    10,
                ],
                pointsPerCh: [
                    360,
                    3600
                ],
                defaultSelected: ({ channelsCount, pointsPerCh }) => channelsCount === 5 && pointsPerCh === 360,
                initSeries: `function (iCh, channelsCount) {
                var { SolidLine, SolidFill, ColorHSV, emptyLine } = require('lcjs')
                return chart.addAreaSeries()
                    .setFillStyle(new SolidFill({ color: ColorHSV( 360 * iCh / channelsCount ).setA(100) }))
                    .setStrokeStyle(emptyLine)
                    .setConnectDataAutomaticallyEnabled(true)
            }`
            }
        ]

        for (var groupInfo of groupsInfo) {
            var group = testsPolar.Group(groupInfo)

            for (var channelsCount of groupInfo.channelCounts) {
                for (var pointsPerCh of groupInfo.pointsPerCh) {
                    group.Test({
                        key: `${channelsCount} series, ${pointsPerCh} points per series`,
                        label: `${channelsCount} series, ${pointsPerCh} points per series`,
                        defaultSelected: groupInfo.defaultSelected({ channelsCount, pointsPerCh }),
                        code: ProtoTestCode(
                            locatePolarChart({ title: `${groupInfo.featureName} ${channelsCount} series, ${pointsPerCh} points per series` }),
                            generatePolarData(channelsCount, pointsPerCh),
                            `function (data, chart) {
                            var channelsSeries = new Array(${channelsCount}).fill(undefined).map((_, iCh) => {
                                return (${groupInfo.initSeries})(iCh, ${channelsCount})
                            })
                            return {
                                data,
                                channelsSeries
                            }
                        }`,
                            `function (env) {
                            var data = env.data
                            var channelsSeries = env.channelsSeries
                            return new Promise(function (resolve, reject) {
                                var tStart = window.performance.now()
                                var iData = 0
                                var update = () => {
                                    const tNow = window.performance.now()
                                    channelsSeries.forEach((series, iCh) => {
                                        series.setData(data[iCh][iData])
                                    })
                                    iData = (iData + 1) % data[0].length

                                    if (tNow - tStart >= testDuration) {
                                        resolve()
                                    }
                                    requestAnimationFrame(update)
                                }
                                update()
                            })
                        }`
                        )
                    })
                }
            }
        }
    })()

// #endregion
