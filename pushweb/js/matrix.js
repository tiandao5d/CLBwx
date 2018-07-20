//双色球红球号码组
var shsq_red_ball = ['01', '02', '03', '04', '05', '06', '07', '08', '09', 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33];
//双色球蓝球号码组
var shsq_blue_ball = ['01', '02', '03', '04', '05', '06', '07', '08', '09', 10, 11, 12, 13, 14, 15, 16];
//福彩3D号码组
var fc3d_ball = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
//从指定数组中产生指定长度的数组
Array.prototype.random_numbers = function (num, repeat, s) {
    var length = this.length;
    if (num >= length) {
        return false;
    }
    var hash = [];
    //号码可以重复？
    repeat = (repeat) ? true : false;
    //是否要排序
    var issort = s ? true : false;
    do {
        var key = Math.floor(Math.random() * (length));
        var number = this[key];
        // 如果可以重复
        if (repeat) {
            hash.push(number);
        } else {
            if ($.inArray(number, hash) == -1) {
                hash.push(number);
            }
        }
    } while (hash.length < num);
    if (issort) hash.sort();
    return hash;
};
function checkBall() {
    var is_submit = true;
    if ($('.red_ball.active').length == 0 && $('.blue_ball.active').length == 0){
        $('#tost').html('红球选择范围8到20个').show();
        is_submit = false;
    }else if ($('.red_ball.active').length < 8 || $('.red_ball.active').length > 20) {
        $('#tost').html('红球选择范围8到20个').show();
        is_submit = false;
    }else{
        if ($('.red_ball.active').length < 8 || $('.red_ball.active').length > 20) {
            $('#tost').html('红球选择范围8到20个').show();
            is_submit = false;
        }
        if ($('.blue_ball.active').length < 1) {
            $('#tost').html('蓝球至少选择1个').show();
            is_submit = false;
        }
    }
    setTimeout(function () {
        $('#tost').hide();
    }, 1500);
    return is_submit;
}
var matrixFilter = {
    init: function () {
        function checkBall() {
            if ($('.red_ball.active').length < 8 || $('.red_ball.active').length > 20) {
                $('#tost').html('红球选择范围8到20个').show();
                return false;
            }
            if ($('.blue_ball.active').length < 1) {
                $('#tost').html('蓝球至少选择1个').show();
                return false;
            }
            setTimeout(function () {
                $('#tost').hide();
            }, 1500);
        }

        var count;
        $('#jx_blue_ball').bind('click', function () {
            $('.blue_cont .blue_ball').removeClass('active');
            var num = parseInt($('.blueBall').val());
            var arr = shsq_blue_ball.random_numbers(num, false, true);

            $('#lock_blue_length').val(num);
            var str = '';

            for (var i = 0; i < arr.length; i++) {
                str = str + parseInt(arr[i]) + ',';
                $('.blue_cont .blue_ball:eq(' + (parseInt(arr[i]) - 1) + ')').addClass('active');
            }
            $('#lock_blue_ball').val(str);
            getResult();
        });
        $('#sel_red').change(function() {
            $('.red_cont .red_ball').removeClass('active');
            var num = parseInt($('.redBall').val());
            $('#lock_red_length').val(num);
            var arr = shsq_red_ball.random_numbers(num, false, true);
            var str = '';
            for (var i = 0; i < arr.length; i++) {
                str = str + parseInt(arr[i]) + ',';
                $('.red_cont .red_ball:eq(' + (parseInt(arr[i]) - 1) + ')').addClass('active');
            }
            $('#lock_red_ball').val(str);
            getResult();
        });
        $('#sel_blue').change(function() {
            $('.blue_cont .blue_ball').removeClass('active');
            var num = parseInt($('.blueBall').val());
            $('#lock_blue_length').val(num);
            var arr = shsq_blue_ball.random_numbers(num, false, true);
            var str = '';
            for (var i = 0; i < arr.length; i++) {
                str = str + parseInt(arr[i]) + ',';
                $('.blue_cont .blue_ball:eq(' + (parseInt(arr[i]) - 1) + ')').addClass('active');
            }
            $('#lock_blue_ball').val(str);
            getResult();
        });
        $('#jx_red_ball').bind('click', function () {
            $('.red_cont .red_ball').removeClass('active');
            var num = parseInt($('.redBall').val());
            var arr = shsq_red_ball.random_numbers(num, false, true);

            $('#lock_red_length').val(num);
            var str = '';

            for (var i = 0; i < arr.length; i++) {
                str = str + parseInt(arr[i])+',';
                $('.red_cont .red_ball:eq(' + (parseInt(arr[i]) - 1) + ')').addClass('active');
            }

            $('#lock_red_ball').val(str);

            getResult();
        });
        $('.red_ball,.blue_ball').bind('click', function () {
            if ($('.red_ball.active').length == 20) {
                if ($(this).hasClass('active')) {
                    $(this).toggleClass('active');
                } else {
                    if ($(this).hasClass('red_ball')) {
                        $('#tost').html('红球选择范围8到20个').show();
                    } else {
                        $(this).toggleClass('active');
                        getResult();
                    }
                    setTimeout(function () {
                        $('#tost').hide();
                    }, 1500);
                }
            } else {
                $(this).toggleClass('active');
                getResult();
            }
            var red_ball = '';
            var blue_ball = '';
            var red_len = 0;
            var blue_len = 0;
            $('.red_ball.active').each(function(){
                if($(this).text()!=""){
                    red_len++;
                    red_ball +=$(this).text()+",";
                }
            });
            $('.blue_ball.active').each(function(){
                if($(this).text()!=""){
                    blue_len++;
                    blue_ball +=$(this).text()+",";
                }
            });
            $('#lock_red_ball').val(red_ball);
            $('#lock_blue_ball').val(blue_ball);
            $('#lock_red_length').val(red_len);
            $('#lock_blue_length').val(blue_len);
        });
        $('#empty_red_ball').bind('click', function () {
            $('.red_ball').removeClass('active');
            $('#lock_red_ball').val('');
            $('#lock_red_length').val('0');
            getResult();
        });
        $('#empty_blue_ball').bind('click', function () {
            $('.blue_ball').removeClass('active');
            $('#lock_blue_ball').val('');
            $('#lock_blue_length').val('0');
            getResult();
        });
        $('#empty_all').bind('click', function () {
            $(this).css({'background': '#ccc', 'border-color': '#e0e0e0'});
            var __ = $(this);
            setTimeout(function () {
                __.css('background', '#fff');
            }, 100);
            $('.red_ball,.blue_ball').removeClass('active');
            $('#lock_red_ball').val('');
            $('#lock_red_length').val('0');
            $('#lock_blue_ball').val('');
            $('#lock_blue_length').val('0');
            getResult();
        });
        $('input[type=radio]').bind('click', function () {
            $(this).addClass('rotateBall').parent().siblings().children().removeClass('rotateBall');
        });
        // 计算注数及金额
        function getResult() {
            var jizhu, price;
            var red_ball = $('.red_ball.active').length;
            var blue_ball = $('.blue_ball.active').length;
            if (red_ball >= 6 && blue_ball >= 1) {
                var num = 1;
                for (var i = red_ball; i > red_ball - 6; i--) {
                    num = num * i;
                }
                jizhu = num / (6 * 5 * 4 * 3 * 2 * 1) * blue_ball;
                price = jizhu * 2;
            } else {
                jizhu = 0;
                price = 0;
            }
            $('.jizhu').html(jizhu + '注');
            $('.how_much').html(price + '元');
        }
    }
};

var matrixFilterDetail = {
    init: function () {
        function jiXuan(num) {
            for (var i = 0; i < num; i++) {
                var $node1 = $('<li></li>');
                var arr = shsq_red_ball.random_numbers(6, false, true);
                var brr = shsq_blue_ball.random_numbers(1);
                var one_zhu = arr.concat(brr);
                for (var j = 0; j < one_zhu.length; j++) {
                    if (j == one_zhu.length - 1) {
                        $node1.append($('<span class="blue">' + one_zhu[j] + '</span>'));
                    } else {
                        $node1.append($('<span class="red">' + one_zhu[j] + '</span>'));
                    }
                }
                $node1.prependTo($('.cont ul'));
            }
        }

        function result() {
            var num = $('.cont ul li').length;
            var price = num * 2;
            $('.jizhu').html(num + '注');
            $('.how_much').html(price + '元');
        }

        $('#suiji_one').bind('click', function () {
            $(this).css({'background': '#ccc', 'border-color': '#e0e0e0'});
            var __ = $(this);
            setTimeout(function () {
                __.css('background', '#fff');
            }, 150);
            jiXuan(1);
            result();
        });
        $('#suiji_five').bind('click', function () {
            $(this).css({'background': '#ccc', 'border-color': '#e0e0e0'});
            var __ = $(this);
            setTimeout(function () {
                __.css('background', '#fff');
            }, 150);
            jiXuan(5);
            result();
        });
    }
};

var zhxStandard = {
    init: function () {
        var count = 0, is_last = false;
        $('.head .col-xs-6:eq(0)').bind('click', function () {
            $(this).addClass('active').siblings().removeClass('active');
            $('.biaozhun').show().siblings('.hezhi').hide();
            $('.jizhu').html('0注');
            $('.how_much').html('0元');
            count = 0;
            window.sessionStorage.setItem('count', count);
        });
        $('.head .col-xs-6:eq(1)').bind('click', function () {
            $(this).addClass('active').siblings().removeClass('active');
            $('.hezhi').show().siblings('.biaozhun').hide();
            $('.jizhu').html('0注');
            $('.how_much').html('0元');
            count = 1;
            window.sessionStorage.setItem('count', count);
        });
        $('.empty').bind('click', function () {
            $(this).parent().siblings('.digits_cont').find('.red_ball').removeClass('active');
            zhxResult();
        });
        $('#empty_all').bind('click', function () {
            $(this).css({'background': '#ccc', 'border-color': '#e0e0e0'});
            var __ = $(this);
            setTimeout(function () {
                __.css('background', '#fff');
            }, 100);
            $('.red_ball').removeClass('active');
            zhxResult();
        });
        $('.biaozhun .red_ball').bind('click', function () {
            $(this).toggleClass('active');
            zhxResult();
        });
        $('.hezhi .red_ball').bind('click', function () {
            is_last = false;
            $(this).toggleClass('active');
            heZhi();
        });
        $('.quan').bind('click', function () {
            $(this).parent().siblings().find('.red_ball').addClass('active');
            zhxResult();
        });
        $('.da').bind('click', function () {
            $(this).parent().siblings().find('.red_ball').removeClass('active');
            for (var i = 5; i < 10; i++) $(this).parent().siblings().find('.red_ball:eq(' + i + ')').addClass('active');
            zhxResult();
        });
        $('.xiao').bind('click', function () {
            $(this).parent().siblings().find('.red_ball').removeClass('active');
            for (var i = 0; i < 5; i++) $(this).parent().siblings().find('.red_ball:eq(' + i + ')').addClass('active');
            zhxResult();
        });
        $('.ji').bind('click', function () {
            $(this).parent().siblings().find('.red_ball').removeClass('active');
            for (var i = 1; i < 10; i++) {
                if (i % 2 != 0) $(this).parent().siblings().find('.red_ball:eq(' + i + ')').addClass('active');
            }
            zhxResult();
        });
        $('.ou').bind('click', function () {
            $(this).parent().siblings().find('.red_ball').removeClass('active');
            for (var i = 0; i < 10; i++) {
                if (i % 2 == 0) $(this).parent().siblings().find('.red_ball:eq(' + i + ')').addClass('active');
            }
            zhxResult();
        });
        function zhxResult() {
            var num1 = $('.baiwei .red_ball.active').length;
            var num2 = $('.shiwei .red_ball.active').length;
            var num3 = $('.gewei .red_ball.active').length;
            var num = num1 * num2 * num3;
            var price = num * 2;
            $('.jizhu').html(num + '注');
            $('.how_much').html(price + '元');
        }

        function endResult() {
            var num1 = $('.biaozhun .baiwei .red_ball.active').length;
            var num2 = $('.biaozhun .shiwei .red_ball.active').length;
            var num3 = $('.biaozhun .gewei .red_ball.active').length;
            if (num1 < 1 || num2 < 1 || num3 < 1) {
                $('#tost').html('每位至少选择1个号码').show();
                setTimeout(function () {
                    $('#tost').hide();
                }, 1500);
                return;
            }
            var arr = [];
            for (var i = 0; i < num1; i++) {
                for (var j = 0; j < num2; j++) {
                    for (var k = 0; k < num3; k++) {
                        var str = $('.baiwei .red_ball.active:eq(' + i + ')').html() + $('.shiwei .red_ball.active:eq(' + j + ')').html() + $('.gewei .red_ball.active:eq(' + k + ')').html();
                        arr.push(str);
                    }
                }
            }
            window.sessionStorage.setItem('fc3d_ball', JSON.stringify(arr));
            window.location.href = './show3d.html';
        }

        // 和值选号部分
        function heZhi() {
            var num1 = $('.hezhi .red_ball.active').length;
            if (num1 == 0) {
                $('#tost').html('至少选择1个号码').show();
                setTimeout(function () {
                    $('#tost').hide();
                }, 1500);
                return;
            }
            var arr = [];
            for (var i = 0; i < num1; i++) {
                var sum = parseInt($('.hezhi .red_ball.active:eq(' + i + ')').html());
                for (var j = 0; j < 10; j++) {
                    for (var m = 0; m < 10; m++) {
                        for (var n = 0; n < 10; n++) {
                            if ((j + m + n) == sum) {
                                var str = j.toString() + m.toString() + n.toString();
                                arr.push(str);
                            }
                        }
                    }
                }
            }
            $('.jizhu').html(arr.length + '注');
            $('.how_much').html(arr.length * 2 + '元');
            if (!is_last) return;
            window.sessionStorage.setItem('fc3d_ball', JSON.stringify(arr));
            window.location.href = './show3d.html';
        }

        // 查看结果
        $('#matrix_filter').bind('click', function () {
            is_last = true;
            count == 0 ? endResult() : heZhi();
        });
        $(function () {
            if (window.sessionStorage.count) {
                var biaoji = parseInt(window.sessionStorage.count);
                if (biaoji == 0) {
                    $('.head .col-xs-6:eq(0)').addClass('active').siblings().removeClass('active');
                    $('.biaozhun').show().siblings('.hezhi').hide();
                } else {
                    $('.head .col-xs-6:eq(1)').addClass('active').siblings().removeClass('active');
                    $('.hezhi').show().siblings('.biaozhun').hide();
                }
            }
        })
    }
};

var zhxStandardDetail = {
    init: function () {
        // 机选
        function jiXuan(num) {

//        var jizhu = $('.cont .red').length;
            for (var i = 0; i < num; i++) {
                var arr = fc3d_ball.random_numbers(3, true, false);
                var str = arr.join('');
                $('<span class="red hui_xian">' + str + '</span>').prependTo($('.cont ul li'));
            }
        }
        // 计算注数及金额
        function result() {
            var num = $('.cont .red').length;
            var price = num * 2;
            $('.jizhu').html(num + '注');
            $('.how_much').html(price + '元');
        }

        // 机选1注
        $('#suiji_one').bind('click', function () {
            $(this).css({'background': '#ccc', 'border-color': '#e0e0e0'});
            var __ = $(this);
            setTimeout(function () {
                __.css('background', '#fff');
            }, 150);
            jiXuan(1);
            result();
            addLine();
        });
        // 机选5注
        $('#suiji_five').bind('click', function () {
            $(this).css({'background': '#ccc', 'border-color': '#e0e0e0'});
            var __ = $(this);
            setTimeout(function () {
                __.css('background', '#fff');
            }, 150);
            jiXuan(5);
            result();
            addLine();
        });

        function addLine() {
            $('.cont .red').removeClass('hui_xian');
            var line_lengh = $('.cont .red').length;
            for (var i = 0; i < line_lengh; i++) {
                if ((i + 1) % 5 != 0) {
                    $('.cont .red:eq(' + i + ')').addClass('hui_xian');
                }
            }
        }

        $(function () {
            if (window.sessionStorage.fc3d_ball) {
                var fc3d_ball = window.sessionStorage.fc3d_ball;
                fc3d_ball = JSON.parse(fc3d_ball);
                $('.cont ul li').html('');
                for (var i = 0; i < fc3d_ball.length; i++) {
                    $('.cont ul li').append($('<span class="red">' + fc3d_ball[i] + '</span>'));
                }
                addLine();
            }
            result();
        })
    }
}