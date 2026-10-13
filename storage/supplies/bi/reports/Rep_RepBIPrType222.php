<!DOCTYPE html>
<html>

<head>
        <meta charset="UTF-8">
        <title>Budget Chart</title>

        <script src="../../js/echarts/echarts.js"></script>
        <script src="../../js/echarts/macarons.js"></script>
        <script src="../../ws_user/js/jquery.min.js"></script>
        <style>
                #main {
                        width: 100%;
                        height: 600px;
                }
        </style>
</head>

<body>
        <div id="main"></div>

        <script>
                var chartDom = document.getElementById('main');
                var myChart = echarts.init(chartDom);

                myChart.showLoading();

                $.get('data/test_budget_data.JSON', function(data) {
                        myChart.hideLoading();

                        var option = {
                                tooltip: {
                                        trigger: 'axis',
                                        axisPointer: {
                                                type: 'shadow',
                                                label: {
                                                        show: true
                                                }
                                        }
                                },
                                legend: {
                                        data: ['Budget 2011', 'Budget 2012','Budget 2013']
                                },
                                grid: {
                                        top: '12%',
                                        left: '1%',
                                        right: '10%',
                                        containLabel: true
                                },
                                xAxis: [{
                                        type: 'category',
                                        data: data.names,
                                        axisLabel: {
                                                interval: 0, // แสดง label ทุกช่อง
                                                rotate: 270 // หมุนเอียง label เพื่อไม่ชนกัน
                                        }
                                }],
                                yAxis: [{
                                        type: 'value',
                                        name: 'Budget (million USD)',
                                        axisLabel: {
                                                formatter: function(a) {
                                                        a = +a;
                                                        return isFinite(a) ? echarts.format.addCommas(+a / 1000) : '';
                                                }
                                        }
                                }],
                                toolbox: {
                                        show: true,
                                        feature: {
                                                mark: {
                                                        show: true
                                                },
                                                dataView: {
                                                        show: true,
                                                        readOnly: false
                                                },
                                                magicType: {
                                                        show: true,
                                                        type: ['line', 'bar','stack','tiled']
                                                },
                                                restore: {
                                                        show: true
                                                },
                                                saveAsImage: {
                                                        show: true
                                                }
                                        }
                                },

                                dataZoom: [{
                                                show: true,
                                                start: 90,
                                                end: 100
                                        },
                                        {
                                                type: 'slider', // แถบเลื่อนแบบมี UI
                                                start: 0,
                                                end: 20 // เริ่มต้นแสดงแค่ 20 จาก 300
                                        },
                                        {
                                                type: 'inside', // scroll mouse + zoom wheel
                                                start: 0,
                                                end: 20
                                        },
                                        {
                                                show: true,
                                                yAxisIndex: 0,
                                                filterMode: 'empty',
                                                width: 30,
                                                height: '80%',
                                                showDataShadow: false,
                                                left: '93%'
                                        }
                                ],
                                series: [{
                                                name: 'Budget 2011',
                                                type: 'bar',
                                                data: data.budget2011List
                                        },
                                        {
                                                name: 'Budget 2012',
                                                type: 'bar',
                                                data: data.budget2012List
                                        },
                                        {
                                                name: 'Budget 2013',
                                                type: 'bar',
                                                data: data.budget2013List
                                        }
                                ]
                        };

                        myChart.setOption(option);
                });
        </script>
</body>

</html>