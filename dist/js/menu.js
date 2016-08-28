function collapseTheMenu () {
    if ($(window).width() < 544) {

        // $('.poi__list-item').click(function() {
            $("#main-menu__items").slideToggle('fast');

            if ($('.icon-button').hasClass('fa-angle-double-down')) {
              console.log("Main menu is opening")
                $('.icon-button').removeClass('fa-angle-double-down').addClass('fa-angle-double-up');
            }
            else if ($('.icon-button').hasClass('fa-angle-double-up')) {
              console.log("Main menu is closing")

                $('.icon-button').removeClass('fa-angle-double-up').addClass('fa-angle-double-down');
            }

        // });
    }
  };

$(document).ready(function() {
    $('.middle').click(function() {
        $('.inactive, .active').toggle();
    });
});
