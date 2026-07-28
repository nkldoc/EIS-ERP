<head>
    <script src = "https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>

    <script>
        $(document).ready(function () {
            console.log('aaaaaa');
            $("#driver").click(function (event) {
                $.getJSON('logs/logs.json', function (jd) {

                    $.each(jd.data, function (i, currProgram) {
                        $.each(currProgram, function (key, val) {
//                                        console.log(key + val.id);
                            $('#stage').html('<p> socket: ' + val.socket + '</p>');
                            $('#stage').append('<p>id : ' + val.id + '</p>');
                            $('#stage').append('<p> name: ' + val.name + '</p>');

                        });
                    });


                });
            });

        });
    </script>
</head>

<body>

    <p>Click on the button to load result.html file:</p>

    <div id = "stage" style = "background-color:#cc0;">
        STAGE
    </div>

    <input type = "button" id = "driver" value = "Load Data" />

</body>