var lastX = 0;
var currentX = 0;
var page = 1;

$(window).scroll(function () {
if (page < maxPages) {
    currentX = $(window).scrollTop();
    if (currentX - lastX > offsetPages * page) {
        lastX = currentX;
        page++;
        if (tag) {
            $.get(srcPages + page + "/tag/" + tag, function(data) {
                $(anchorPages).replaceWith(data);
            });
        }
        else if (category) {
            $.get(srcPages + page + "/category/" + category, function(data) {
                $(anchorPages).replaceWith(data);
            });
        }
        else if (country) {
            $.get(srcPages + page + "/country/" + country, function(data) {
                $(anchorPages).replaceWith(data);
            });
        } else {
            $.get(srcPages + page, function(data) {
                $(anchorPages).replaceWith(data);
            });            
        }
    }
}
});
