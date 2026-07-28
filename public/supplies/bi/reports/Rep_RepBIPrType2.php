<!DOCTYPE html>
<html>

<head>
        <meta charset="UTF-8">
        <title>Pie + Line (Linked Dataset)</title>
        <!-- <script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/echarts/theme/dark.js"></script> -->
        <!-- <script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></script> -->
        <script src="../../js/echarts/echarts.js"></script>
        <script src="../../js/echarts/macarons.js"></script>
        <style>
                body {
                        margin: 0;
                        font-family: sans-serif;
                        transition: background 0.3s;
                }

                .switch-container {
                        padding: 10px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                }

                .switch {
                        position: relative;
                        display: inline-block;
                        width: 50px;
                        height: 24px;
                }

                .switch input {
                        opacity: 0;
                        width: 0;
                        height: 0;
                }

                .slider {
                        position: absolute;
                        cursor: pointer;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: #ccc;
                        border-radius: 24px;
                        transition: 0.4s;
                }

                .slider:before {
                        position: absolute;
                        content: "";
                        height: 18px;
                        width: 18px;
                        left: 3px;
                        bottom: 3px;
                        background-color: white;
                        border-radius: 50%;
                        transition: 0.4s;
                }

                input:checked+.slider {
                        background-color: #1c1c3c;
                }

                input:checked+.slider:before {
                        transform: translateX(26px);
                }

                #chart {
                        width: 100%;
                        height: 600px;
                }
        </style>
</head>

<body>
        <div class="switch-container">
                <label class="switch">
                        <input type="checkbox" id="toggleTheme" />
                        <span class="slider"></span>
                </label>
                <label for="toggleTheme">Dark Mode</label>
        </div>

        <div id="chart"></div>

        <div id="main" style="width:100%;height:600px;"></div>
        <button onclick="toggleTheme()">Toggle Dark Mode</button>

        <script>
                var chartDom = document.getElementById('main');
                var myChart = echarts.init(document.getElementById('main'), 'dark');

                const option = {
                        legend: {},
                        tooltip: {},
                        dataset: {
                                source: [
                                        ['product', '2012', '2013', '2014', '2015', '2016', '2017'],
                                        ['Milk Tea', 56.3, 82.1, 89.3, 72.4, 55.1, 88.0],
                                        ['Matcha Latte', 50.1, 49.9, 52.3, 50.5, 70.2, 65.0],
                                        ['Cheese Cocoa', 40.0, 62.5, 69.4, 35.6, 44.2, 32.8],
                                        ['Walnut Brownie', 25.2, 35.6, 40.2, 25.9, 34.6, 48.5]
                                ]
                        },
                        grid: [{
                                top: '55%',
                                bottom: '15%'
                        }],
                        xAxis: {
                                type: 'category',
                                gridIndex: 0
                        },
                        yAxis: {
                                gridIndex: 0
                        },
                        series: [{
                                        type: 'pie',
                                        id: 'pie',
                                        radius: '30%',
                                        center: ['50%', '25%'],
                                        label: {
                                                formatter: '{b}: {c} ({d}%)'
                                        },
                                        encode: {
                                                itemName: 'product',
                                                value: '2013'
                                        }
                                },
                                {
                                        type: 'line',
                                        smooth: true,
                                        seriesLayoutBy: 'row'
                                },
                                {
                                        type: 'line',
                                        smooth: true,
                                        seriesLayoutBy: 'row'
                                },
                                {
                                        type: 'line',
                                        smooth: true,
                                        seriesLayoutBy: 'row'
                                },
                                {
                                        type: 'line',
                                        smooth: true,
                                        seriesLayoutBy: 'row'
                                }
                        ]
                };

                var currentTheme = 'light';
                var chartDom = document.getElementById('chart');
                var myChart = echarts.init(chartDom, currentTheme);

                myChart.setOption(option); // ใส่ option ปกติ

                document.getElementById('toggleTheme').addEventListener('change', function() {
                        currentTheme = this.checked ? 'dark' : 'light';
                        myChart.dispose();
                        myChart = echarts.init(chartDom, currentTheme);
                        myChart.setOption(option);
                });
        </script>
</body>

</html>