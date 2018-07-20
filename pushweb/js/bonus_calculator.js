$(function () {
    if (window.sessionStorage.one_active) {
        var one_active = window.sessionStorage.one_active;
    } else {
        var one_active = 'shsq';
    }
    if (window.sessionStorage.two_active) {
        var two_active = window.sessionStorage.two_active;
    } else {
        var two_active = 'shsq_first';
    }
    switch (one_active) {
        case 'shsq':
            $('.bets_way_name').removeClass('active');
            $('.head_tab .col-xs-6:first').addClass('active').siblings().removeClass('active').parent().siblings('.shsq').show().siblings('.sevenlc').hide();
            if (two_active == 'shsq_first') {
                $('.shsq .bets_way .bets_way_name:first').addClass('active').parent().siblings().children('.bets_way_name').removeClass('active');
                $('#general_shsq').show().siblings('#bravery_shsq').hide();
            }
            if (two_active == 'shsq_last') {
                $('.shsq .bets_way .bets_way_name:last').addClass('active').parent().siblings().children('.bets_way_name').removeClass('active');
                $('#general_shsq').hide().siblings('#bravery_shsq').show();
            }
            break;
        case 'sevenlc':
            $('.bets_way_name').removeClass('active');
            $('.head_tab .col-xs-6:last').addClass('active').siblings().removeClass('active').parent().siblings('.shsq').hide().siblings('.sevenlc').show();
            if (two_active == 'sevenlc_first') {
                $('.sevenlc .bets_way .bets_way_name:first').addClass('active').parent().siblings().children('.bets_way_name').removeClass('active');
                $('#general_7lc').show().siblings('#bravery_7lc').hide();
            }
            if (two_active == 'sevenlc_last') {
                $('.sevenlc .bets_way .bets_way_name:last').addClass('active').parent().siblings().children('.bets_way_name').removeClass('active');
                $('#general_7lc').hide().siblings('#bravery_7lc').show();
            }
            break;
    }
});
function reset(obj) {
    $('.tuchu.red').removeClass('red');
    var lengh = $(obj + ' .bonus_classify .row').length;
    for (var i = 0; i < lengh; i++) {
        $(obj + ' .bonus_classify .row:eq(' + i + ') .tuchu:eq(0)').html('0');
        $(obj + ' .bonus_classify .row:eq(' + i + ') .tuchu:eq(2)').html('0');
    }
}
$('.shsq .bets_way .bets_way_name:first').bind('click', function () {
    $('.bets_way_name').removeClass('active');
    $(this).addClass('active').parent().siblings().children('.bets_way_name').removeClass('active');
    $('#general_shsq').show().siblings('#bravery_shsq').hide();
    $('.zhushu').html('1');
    $('.price').html('2');
    $('.bonus_num').html('0');
    reset('.shsq');
    window.sessionStorage.setItem('two_active', 'shsq_first');
});
$('.shsq .bets_way .bets_way_name:last').bind('click', function () {
    $('.bets_way_name').removeClass('active');
    $(this).addClass('active').parent().siblings().children('.bets_way_name').removeClass('active');
    $('#general_shsq').hide().siblings('#bravery_shsq').show();
    $('.zhushu').html('0');
    $('.price').html('0');
    $('.bonus_num').html('0');
    reset('.shsq');
    window.sessionStorage.setItem('two_active', 'shsq_last');
});
$('.sevenlc .bets_way .bets_way_name:first').bind('click', function () {
    $('.bets_way_name').removeClass('active');
    $(this).addClass('active').parent().siblings().children('.bets_way_name').removeClass('active');
    $('#general_7lc').show().siblings('#bravery_7lc').hide();
    $('.zhushu').html('1');
    $('.price').html('2');
    $('.bonus_num').html('0');
    reset('.sevenlc');
    window.sessionStorage.setItem('two_active', 'sevenlc_first');
});
$('.sevenlc .bets_way .bets_way_name:last').bind('click', function () {
    $('.bets_way_name').removeClass('active');
    $(this).addClass('active').parent().siblings().children('.bets_way_name').removeClass('active');
    $('#general_7lc').hide().siblings('#bravery_7lc').show();
    $('.zhushu').html('0');
    $('.price').html('0');
    $('.bonus_num').html('0');
    reset('.sevenlc');
    window.sessionStorage.setItem('two_active', 'sevenlc_last');
});
$('.head_tab .col-xs-6:first').bind('click', function () {
    $('.bets_way_name').removeClass('active');
    $('.shsq .bets_way_name:first').addClass('active');
    $('#general_shsq').show().siblings('#bravery_shsq').hide();
    $(this).addClass('active').siblings().removeClass('active').parent().siblings('.shsq').show().siblings('.sevenlc').hide();
    $('.zhushu').html('1');
    $('.price').html('2');
    $('.bonus_num').html('0');
    reset('.shsq');
    window.sessionStorage.setItem('one_active', 'shsq');
});
$('.head_tab .col-xs-6:last').bind('click', function () {
    $('.bets_way_name').removeClass('active');
    $('.sevenlc .bets_way_name:first').addClass('active');
    $('#general_7lc').show().siblings('#bravery_7lc').hide();
    $(this).addClass('active').siblings().removeClass('active').parent().siblings('.sevenlc').show().siblings('.shsq').hide();
    $('.zhushu').html('1');
    $('.price').html('2');
    $('.bonus_num').html('0');
    reset('.sevenlc');
    window.sessionStorage.setItem('one_active', 'sevenlc');
});
$('#general_shsq_red_touzhu,#general_shsq_blue_touzhu,#bravery_shsq_red_touzhu,#drag_shsq_red_touzhu,#bravery_shsq_blue_touzhu').change(function () {
    getResult();
});
$('#bravery_shsq_red_touzhu').change(function () {
    $('#bravery_shsq_red_hit').html('');
    var val = $(this).val();
    for (var i = 0; i <= val; i++) {
        if (i == 0) {
            $('#bravery_shsq_red_hit').append('<option value="' + i + '" selected="selected">' + i + '个</option>');
        } else {
            $('#bravery_shsq_red_hit').append('<option value="' + i + '">' + i + '个</option>');
        }
    }
});
$('#bravery_shsq_red_hit').change(function () {
    $('#drag_shsq_red_hit').html('');
    var val = $(this).val();
    for (var i = 0; i <= 6 - val; i++) {
        if (i == 0) {
            $('#drag_shsq_red_hit').append('<option value="' + i + '" selected="selected">' + i + '个</option>');
        } else {
            $('#drag_shsq_red_hit').append('<option value="' + i + '">' + i + '个</option>');
        }
    }
});
function getResult() {
    var now_active = $('.bets_way_name.active').html();
    var zhushu, price;
    switch (now_active) {
        case '普通':
            var general_shsq_red_touzhu = parseInt($('#general_shsq_red_touzhu').val());
            var general_shsq_blue_touzhu = parseInt($('#general_shsq_blue_touzhu').val());
            zhushu = shsqDouble(general_shsq_red_touzhu) * general_shsq_blue_touzhu;
            break;
        case '拖胆':
            var bravery_shsq_red_touzhu = parseInt($('#bravery_shsq_red_touzhu').val());
            var drag_shsq_red_touzhu = parseInt($('#drag_shsq_red_touzhu').val());
            var bravery_shsq_blue_touzhu = parseInt($('#bravery_shsq_blue_touzhu').val());
            if (bravery_shsq_red_touzhu + drag_shsq_red_touzhu == 6) {
                zhushu = 1 * bravery_shsq_blue_touzhu;
                break;
            }
            if (bravery_shsq_red_touzhu + drag_shsq_red_touzhu < 6) {
                zhushu = 0;
                break;
            }
            if (bravery_shsq_red_touzhu + drag_shsq_red_touzhu > 6) {
                zhushu = jiesh(drag_shsq_red_touzhu, 6 - bravery_shsq_red_touzhu) * bravery_shsq_blue_touzhu;
                break;
            }
    }
    price = zhushu * 2;
    $('.zhushu').html(zhushu);
    $('.price').html(price);
}
function shsqDouble(obj) {
    var num = (obj * (obj - 1) * (obj - 2) * (obj - 3) * (obj - 4) * (obj - 5)) / (6 * 5 * 4 * 3 * 2 * 1);
    return num;
}
function jiesh(num1, num2) {
    if (num1 < num2 || num1 < 1 || num2 < 0) {
        return 0;
    } else {
        if (num2 == 0) {
            return 1;
        } else {
            var num3 = 1, num4 = 1;
            for (var i = (num1 - num2 + 1); i <= num1; i++) {
                num3 = num3 * i;
            }
            for (var j = 1; j <= num2; j++) {
                num4 = num4 * j;
            }
            return num3 / num4;
        }
    }
}
$('#general_7lc_red_touzhu').change(function () {
    var val = $(this).val();
    var zhushu = jiesh(val, 7);
    var price = zhushu * 2;
    $('.zhushu').html(zhushu);
    $('.price').html(price);
});
$('#bravery_7lc_red_touzhu').change(function () {
    var val = $(this).val();
    $('#bravery_7lc_red_hit').html('');
    for (var i = 0; i <= val; i++) {
        if (i == 0) {
            $('#bravery_7lc_red_hit').append('<option value="' + i + '" selected="selected">' + i + '个</option>');
        } else {
            $('#bravery_7lc_red_hit').append('<option value="' + i + '">' + i + '个</option>');
        }
    }
    var val_two = $('#drag_7lc_red_touzhu').val();
    var zhushu = jiesh(val_two, 7 - val);
    var price = zhushu * 2;
    $('.zhushu').html(zhushu);
    $('.price').html(price);
});
$('#drag_7lc_red_touzhu').change(function () {
    var val = $(this).val();
    $('#drag_7lc_red_hit').html('');
    for (var i = 0; i <= val; i++) {
        if (i == 0) {
            $('#drag_7lc_red_hit').append('<option value="' + i + '" selected="selected">' + i + '个</option>');
        } else {
            $('#drag_7lc_red_hit').append('<option value="' + i + '">' + i + '个</option>');
        }
    }
    var val_two = $('#bravery_7lc_red_touzhu').val();
    var zhushu = jiesh(val, 7 - val_two);
    var price = zhushu * 2;
    $('.zhushu').html(zhushu);
    $('.price').html(price);
});
$('#bravery_7lc_red_hit').change(function () {
    var val = parseInt($(this).val());
    var val2 = parseInt($('#drag_7lc_red_hit').val());
    $('#drag_7lc_red_hit').html('');
    for (var i = 0; i <= 7 - val; i++) {
        if (i == 0) {
            $('#drag_7lc_red_hit').append('<option value="' + i + '" selected="selected">' + i + '个</option>');
        } else {
            $('#drag_7lc_red_hit').append('<option value="' + i + '">' + i + '个</option>');
        }
    }
    if (val + val2 < 8) $('#drag_7lc_red_hit').val(val2);
});
var t = {
    number: {
        combo: function (e, t) {
            var n, r;
            e / 2 < t && (t = e - t);
            if (e < t || t < 0)
                return 0;
            if (e >= 0 && t === 0)
                return 1;
            n = 1,
                r = e;
            for (var i = 1; i <= t; i++)
                n *= i,
                i < t && (r *= e - i);
            return r / n
        }
    },
    pages: {
        Ccombo: function (e, t) {
            var n, r;
            e / 2 < t && (t = e - t);
            if (e < t || t < 0)
                return 0;
            if (e >= 0 && t === 0)
                return 1;
            n = 1,
                r = e;
            for (var i = 1; i <= t; i++)
                n *= i,
                i < t && (r *= e - i);
            return r / n
        },
        Rank: function (e, t, n) {
            var r = e * 1 + t * 1;
            switch (r) {
                case 7:
                    return 0;
                case 6:
                    return n ? 1 : 2;
                case 5:
                    return n ? 3 : 4;
                case 4:
                    return n ? 5 : 6;
                default:
                    return -1;
            }
        },
        Rankdt: function (e, n, r) {
            var i = -1;
            switch (r) {
                case"0":
                    i = t.pages.Rank(e, n, !1);
                    break;
                case"1":
                    i = t.pages.Rank(e - 1, n, !1), i = i > -1 ? i % 2 ? i : i - 1 : -1;
                    break;
                case"2":
                    i = t.pages.Rank(e - 1, n, !1), i = i > -1 ? i % 2 ? i : i - 1 : -1;
                    break;
                default:
                    i = -1
            }
            return i;
        }
    },
    shsq: {
        tuChu: function (num, zhushu, money) {
            $('.bonus_classify .row:eq(' + num + ') .tuchu').addClass('red');
            $('.bonus_classify .row:eq(' + num + ') .tuchu:eq(0)').html(zhushu);
            $('.bonus_classify .row:eq(' + num + ') .tuchu:eq(2)').html(money);
        },
        show: function (o) {
            for (var j = 0; j < o.length; j++) {
                switch (j) {
                    case 0:
                        if (o[j] != 0) t.shsq.tuChu(1, o[j], o[j] * parseInt($('.ssq_no_one').html()));
                        break;
                    case 1:
                        if (o[j] != 0) t.shsq.tuChu(2, o[j], o[j] * parseInt($('.ssq_no_two').html()));
                        break;
                    case 2:
                        if (o[j] != 0) t.shsq.tuChu(3, o[j], o[j] * 3000);
                        break;
                    case 3:
                        if (o[j] != 0) t.shsq.tuChu(4, o[j], o[j] * 200);
                        break;
                    case 4:
                        if (o[j] != 0) t.shsq.tuChu(5, o[j], o[j] * 10);
                        break;
                    case 5:
                        if (o[j] != 0) t.shsq.tuChu(6, o[j], o[j] * 5);
                        break;
                }
            }
        }
    },
    sevenlc: {
        tuChu: function (num, zhushu, money) {
            $('.sevenlc .bonus_classify .row:eq(' + num + ') .tuchu').addClass('red');
            $('.sevenlc .bonus_classify .row:eq(' + num + ') .tuchu:eq(0)').html(zhushu);
            $('.sevenlc .bonus_classify .row:eq(' + num + ') .tuchu:eq(2)').html(money);
        },
        show: function (o) {
            $.each(o, function (j, m) {
                switch (j) {
                    case 0:
                        if (m != 0) t.sevenlc.tuChu(1, m, m * parseInt($('.sevenlc_no_one').html()));
                        break;
                    case 1:
                        if (m != 0) t.sevenlc.tuChu(2, m, m * parseInt($('.sevenlc_no_two').html()));
                        break;
                    case 2:
                        if (m != 0) t.sevenlc.tuChu(3, m, m * parseInt($('.sevenlc_no_thr').html()));
                        break;
                    case 3:
                        if (m != 0) t.sevenlc.tuChu(4, m, m * 200);
                        break;
                    case 4:
                        if (m != 0) t.sevenlc.tuChu(5, m, m * 50);
                        break;
                    case 5:
                        if (m != 0) t.sevenlc.tuChu(6, m, m * 10);
                        break;
                    case 6:
                        if (m != 0) t.sevenlc.tuChu(7, m, m * 5);
                        break;
                }
            })
        }
    }
}
// 双色球普通投注奖金计算
var getShsqGeneralBonus = {
    getLastResult: function () {
        var n = parseInt($('#general_shsq_red_touzhu').val());
        var r = parseInt($('#general_shsq_blue_touzhu').val());
        var i = parseInt($('#general_shsq_red_hit').val());
        var s = parseInt($('#general_shsq_blue_hit').val());
        var o = [0, 0, 0, 0, 0, 0];
        switch (i) {
            case 0:
            case 1:
            case 2:
                s > 0 && (o[5] += t.number.combo(n, 6));
                break;
            case 3:
                s > 0 && (o[5] += t.number.combo(n - i, 4) * t.number.combo(i, 2),
                    o[5] += t.number.combo(n - i, 5) * t.number.combo(i, 1),
                    o[5] += t.number.combo(n - i, 6),
                    o[4] += t.number.combo(n - i, 3));
                break;
            case 4:
                s > 0 ? (o[5] += t.number.combo(n - i, 6),
                        o[5] += t.number.combo(n - i, 5) * t.number.combo(i, 1),
                        o[5] += t.number.combo(n - i, 4) * t.number.combo(i, 2),
                        o[4] += t.number.combo(n - i, 3) * t.number.combo(i, 3),
                        o[4] += t.number.combo(n - i, 2) * t.number.combo(i, 4) * (r - 1),
                        o[3] += t.number.combo(n - i, 2)) : o[4] += t.number.combo(n - i, 2) * r;
                break;
            case 5:
                s > 0 ? (o[5] += t.number.combo(n - i, 6),
                        o[5] += t.number.combo(n - i, 5) * t.number.combo(i, 1),
                        o[5] += t.number.combo(n - i, 4) * t.number.combo(i, 2),
                        o[4] += t.number.combo(n - i, 3) * t.number.combo(i, 3),
                        o[4] += t.number.combo(n - i, 2) * t.number.combo(i, 4) * (r - 1),
                        o[3] += t.number.combo(n - i, 2) * t.number.combo(i, 4),
                        o[3] += t.number.combo(n - i, 1) * t.number.combo(i, 5) * (r - 1),
                        o[2] += t.number.combo(n - i, 1)) : (o[4] += t.number.combo(n - i, 2) * t.number.combo(i, 4) * r,
                        o[3] += t.number.combo(n - i, 1) * t.number.combo(i, 5) * r);
                break;
            case 6:
                s > 0 ? (o[5] += t.number.combo(n - i, 6),
                        o[5] += t.number.combo(n - i, 5) * t.number.combo(i, 1),
                        o[5] += t.number.combo(n - i, 4) * t.number.combo(i, 2),
                        o[4] += t.number.combo(n - i, 3) * t.number.combo(i, 3),
                        o[4] += t.number.combo(n - i, 2) * t.number.combo(i, 4) * (r - 1),
                        o[3] += t.number.combo(n - i, 2) * t.number.combo(i, 4),
                        o[3] += t.number.combo(n - i, 1) * t.number.combo(i, 5) * (r - 1),
                        o[2] += t.number.combo(n - i, 1) * t.number.combo(i, 5),
                        o[1] += r - 1,
                        o[0]++) : (o[4] += t.number.combo(n - i, 2) * t.number.combo(i, 4) * r,
                        o[3] += t.number.combo(n - i, 1) * t.number.combo(i, 5) * r,
                        o[1] += r);
                break;
        }
        t.shsq.show(o);
    }
};
// 双色球胆拖投注奖金计算
var getShsqBravelBonus = {
    getLastResult: function () {
        t.pages.Rank = function (e, t) {
            var n = e * 1 + t * 1;
            switch (n) {
                case 7:
                    return 0;
                case 6:
                    return t == 1 ? 2 : 1;
                case 5:
                    return 3;
                case 4:
                    return 4;
                default:
                    return t == 1 ? 5 : -1;
            }
        }
            ,
            t.pages.Tank = function (e) {
                return e == 0 ? 1 : t.pages.Tank(e - 1) * e;
            }
            ,
            t.pages.Ccombo = function (e, n) {
                if (n <= e) {
                    var r = t.pages.Tank(e - n) * t.pages.Tank(n);
                    return r = t.pages.Tank(e) / r,
                        r
                }
                return 0
            }
            ,
            t.pages.DT = function (e, n, r, i, s, o) {
                var u = s <= 6 - e ? s : 6 - e
                    , a = new Array;
                for (var f = 0; f <= u; f++)
                    a[f] = i + f;
                var l = [0, 0, 0, 0, 0, 0]
                    , c = 0;
                if (o == 1)
                    for (var f = 0; f <= u; f++)
                        c = t.pages.Rank(a[f], 0),
                        c != -1 && (l[c] += t.pages.Ccombo(n - s, 6 - e - f) * (r - 1) * t.pages.Ccombo(s, f)),
                            c = t.pages.Rank(a[f], 1),
                            l[c] += t.pages.Ccombo(n - s, 6 - e - f) * t.pages.Ccombo(s, f);
                if (o == 0)
                    for (var f = 0; f <= u; f++)
                        c = t.pages.Rank(a[f], 0),
                        c != -1 && (l[c] += t.pages.Ccombo(n - s, 6 - e - f) * r * t.pages.Ccombo(s, f));
                return l
            }
        var n = parseInt($('#bravery_shsq_red_touzhu').val());
        var r = parseInt($('#drag_shsq_red_touzhu').val());
        var i = parseInt($('#bravery_shsq_blue_touzhu').val());
        var s = parseInt($('#bravery_shsq_red_hit').val());
        var o = parseInt($('#drag_shsq_red_hit').val());
        var u = parseInt($('#bravery_shsq_blue_hit').val());
        var a = [0, 0, 0, 0, 0, 0];
        a = t.pages.DT(n, r, i, s, o, u);
        t.shsq.show(a);
    }
};

// 七乐彩普通投注奖金计算
var getSevenGeneralBonus = {
    getLastResult: function () {
        var n = parseInt($('#general_7lc_red_touzhu').val());
        var r = parseInt($('#general_7lc_red_hit').val());
        var i = $("#general_have_hit").prop("checked");
        var s = [0, 0, 0, 0, 0, 0, 0];
        switch (r) {
            case 4:
                i ? (s[5] += t.number.combo(5, 5) * t.number.combo(n - 5, 2), s[6] += t.number.combo(n - 4, 3) - t.number.combo(n - 5, 2) > 0 ? t.number.combo(n - 4, 3) - t.number.combo(n - 5, 2) : 0) : s[6] += t.number.combo(4, 4) * t.number.combo(n - 4, 3);
                break;
            case 5:
                i ? (s[3] += t.number.combo(6, 6) * t.number.combo(n - 6, 1), s[5] += t.number.combo(5, 4) * t.number.combo(n - 5 - 1, 2), s[4] += t.number.combo(5, 5) * t.number.combo(n - 5, 2) - t.number.combo(6, 6) * t.number.combo(n - 6, 1) > 0 ? t.number.combo(5, 5) * t.number.combo(n - 5, 2) - t.number.combo(6, 6) * t.number.combo(n - 6, 1) : 0, s[6] += t.number.combo(5, 4) * t.number.combo(n - 5, 3) - t.number.combo(5, 4) * t.number.combo(n - 5 - 1, 2)) : (s[4] += t.number.combo(5, 5) * t.number.combo(n - 5, 2), s[6] += t.number.combo(5, 4) * t.number.combo(n - 5, 3));
                break;
            case 6:
                i ? (s[6] += t.number.combo(6, 4) * t.number.combo(n - 6, 3) - t.number.combo(6, 4) * t.number.combo(n - 6 - 1, 2), s[5] += t.number.combo(6, 4) * t.number.combo(n - 6 - 1, 2), s[4] += t.number.combo(6, 5) * t.number.combo(n - 6, 2) - t.number.combo(6, 5) * t.number.combo(n - 6 - 1, 1), s[3] += t.number.combo(6, 5) * t.number.combo(n - 6 - 1, 1), s[1] += t.number.combo(7, 7) * t.number.combo(n - 7, 0), s[2] += t.number.combo(6, 6) * t.number.combo(n - 6, 1) - t.number.combo(7, 7) * t.number.combo(n - 7, 0) > 0 ? t.number.combo(6, 6) * t.number.combo(n - 6, 1) - t.number.combo(7, 7) * t.number.combo(n - 7, 0) : 0) : (s[6] += t.number.combo(6, 4) * t.number.combo(n - 6, 3), s[4] += t.number.combo(6, 5) * t.number.combo(n - 6, 2), s[2] += t.number.combo(6, 6) * t.number.combo(n - 6, 1));
                break;
            case 7:
                i ? (s[6] += t.number.combo(7, 4) * t.number.combo(n - 7, 3) - t.number.combo(7, 4) * t.number.combo(n - 7 - 1, 2), s[5] += t.number.combo(7, 4) * t.number.combo(n - 7 - 1, 2), s[4] += t.number.combo(7, 5) * t.number.combo(n - 7, 2) - t.number.combo(7, 5) * t.number.combo(n - 7 - 1, 1), s[3] += t.number.combo(7, 5) * t.number.combo(n - 7 - 1, 1), s[2] += t.number.combo(7, 6) * t.number.combo(n - 7, 1) - 7, n > 7 && (s[1] += t.number.combo(7, 6))) : (s[6] += t.number.combo(7, 4) * t.number.combo(n - 7, 3), s[4] += t.number.combo(7, 5) * t.number.combo(n - 7, 2), s[2] += t.number.combo(7, 6) * t.number.combo(n - 7, 1)), s[0] += t.number.combo(r, 7)
        }
        t.sevenlc.show(s);
    }
};
// 七乐彩拖胆投注奖金计算

function jisuan(n, r, i, s, b) {
    var o = s <= 7 - n ? s : 7 - n, u = [], a = b;
//            e("#dmz").prop("checked") ? a = "1" : e("#tmz").prop("checked") ? a = "2" : a = "0";
    for (var f = 0; f <= o; f++)u[f] = i + f;
    var l = [0, 0, 0, 0, 0, 0, 0], c = 0;
    for (var f = 0; f <= o; f++)a != "2" ? (c = t.pages.Rankdt(u[f], 0, a), c != -1 && (l[c] += t.pages.Ccombo(r - s, 7 - n - f) * t.pages.Ccombo(s, f))) : (c = t.pages.Rankdt(u[f], 0, "0"), c != -1 && (l[c] += t.pages.Ccombo(r - s, 7 - n - f) * t.pages.Ccombo(Math.max(s - 1, 0), f)), c = t.pages.Rankdt(u[f], 0, "2"), c != -1 && (l[c] += t.pages.Ccombo(r - s, 7 - n - f) * t.pages.Ccombo(Math.max(s - 1, 0), f - 1)));
    return l;
}

var getSevenBravelBonus = {
    getLastResult: function () {
        var n = parseInt($('#bravery_7lc_red_touzhu').val());
        var i = parseInt($('#bravery_7lc_red_hit').val());
        var r = parseInt($('#drag_7lc_red_touzhu').val());
        var s = parseInt($('#drag_7lc_red_hit').val());
        var b = $('#bravery_7lc .special_num input:checked').attr('n');
        var o = [0, 0, 0, 0, 0, 0, 0];
        o = jisuan(n, r, i, s, b);
        t.sevenlc.show(o);
    }
};
function tihuan(cn) {
    var am = 0, sm = 0;
    for (var j = 0; j < $(cn + ' .money.red').length; j++) {
        var val = $('.money.red:eq(' + j + ')').html();
        if (val.indexOf('A') >= 0 || val.indexOf('B') >= 0) {
            var val1 = val + '+';
            am += val1;
        } else {
            var val2 = parseInt(val);
            sm += val2;
        }
    }
    if (sm == 0) {
        if (isNaN(am)) am = am.substring(0, am.length - 1);
    } else {
        am += sm;
    }
    if (isNaN(am)) am = am.replace(/^[0]+/, "").replace(/^.*\+$/, "");
    $(cn + ' .bonus_num').html(am);
}
$('.jisuan .btn').bind('click', function () {
    $('.bonus_classify .row .tuchu').removeClass('red');
    for (var i = 0; i < $('.bonus_classify .row').length; i++) {
        $('.bonus_classify .row:eq(' + i + ') .tuchu:eq(0)').html("0");
        $('.bonus_classify .row:eq(' + i + ') .tuchu:eq(2)').html("0");
    }
    var str1 = $('.head_tab .col-xs-6.active').html();
    var str2 = $('.bets_way_name.active').html();
    if (str1 == '双色球' && str2 == '普通') {
        getShsqGeneralBonus.getLastResult();
        tihuan('.shsq');
    }
    if (str1 == '双色球' && str2 == '拖胆') {
        getShsqBravelBonus.getLastResult();
        tihuan('.shsq');
    }
    if (str1 == '七乐彩' && str2 == '普通') {
        getSevenGeneralBonus.getLastResult();
        tihuan('.sevenlc');
    }
    if (str1 == '七乐彩' && str2 == '拖胆') {
        if (parseInt($('#bravery_7lc_red_touzhu').val()) + parseInt($('#drag_7lc_red_touzhu').val()) < 7) {
            alert('胆码加拖码个数不能少于7个!');
        } else {
            getSevenBravelBonus.getLastResult();
            tihuan('.sevenlc');
        }
    }
});

$('#periods_shsq,#periods_7lc').change(function () {
    var iid = $(this).attr('id');
    var balls = $(this).find('option:selected').attr('data-red').split(',');
    var blue_ball = $(this).find('option:selected').attr('data-blue');
    var bid;
    balls.push(blue_ball);
    var no_one = $(this).find('option:selected').attr('data-prize1_bonus') || 'A';
    var no_two = $(this).find('option:selected').attr('data-prize2_bonus') || 'B';
    var no_thr = $(this).find('option:selected').attr('data-prize3_bonus') || 'C';
    iid === 'periods_shsq' ? (bid = 'lottery_ssq',$('.ssq_no_one').html(no_one),$('.ssq_no_two').html(no_two)) : (bid = 'lottery_sevenlc',$('.sevenlc_no_one').html(no_one),$('.sevenlc_no_two').html(no_two),$('.sevenlc_no_thr').html(no_thr));
    $('#'+bid).html('');
    $.each(balls,function (i,e) {
        i === balls.length - 1 ? $('#'+bid).append('<span class="ball blue_all_ball">'+e+'</span>') : $('#'+bid).append('<span class="ball red_all_ball">'+e+'</span> ');
    });
    console.log(no_thr);
});
