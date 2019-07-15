(function($) {
    "use strict"; // Start of use strict

    $(function() {
        $.getJSON("projects.json", function(json) {
            // console.log(json);
            $.each(json, function(){
                createProjectIcons(this);
            });
        });

        $("#downloadbutton").click(function() {
          //var content = content of file;
          var dl = document.createElement('a');
          dl.setAttribute('href', 'SiMeng_resume.pdf' );
          dl.setAttribute('download', 'SiMeng_resume');
          dl.click();
        });

    });

    function createProjectIcons(project) {
        var proDiv = $('<div class="col-sm-3 portfolio-item"></div>');
        var portfolioModal = $('<a href="#portfolioModal" class="portfolio-link" data-toggle="modal"></a>');
        var caption = $('<div class="caption"><div class="caption-content"><i class="fa fa-search-plus fa-3x"></i></div></div>');
        var image = $('<img class="img-responsive">');
        $(image).attr("src", project.icon);
        $(image).attr("alt", project.title);
        $(portfolioModal).append(caption, image);
        $(proDiv).append(portfolioModal);
        $(proDiv).click(function() {
            createProfile(project);
        });
        $('#portfolio_list').append(proDiv);
    }

    function createProfile(project) {
        console.log(project);
        $('#modal_title').text(project.title);
        $('#modal_img').attr("src", project.image);
        $('#modal_content').text(project.content);
        
        $('#modal_date').text(project.date);
        $('.modal_link').remove();
        if(project.lan && project.lan!="") {
            console.log(project.lan);
            $('#modal_lan').text(project.lan);
            $('#modal_lan_list').show();
        }else {
            $('#modal_lan_list').hide();
        }
        if(project.link!="") {
            var links = project.link.split(',');
            $.each(links, function(i) {
                var link = $('<a href="#" class="btn btn-default modal_link" target="_blank"><i class="fa fa-external-link"></i></a>');
                link.attr("href", this);
                var text = '';
                if(links.length>1) {
                    var dates = project.date.split(",");
                    link.text(text+"Version "+dates[i]);
                }else {
                    link.text(text+"Go");
                }
                $('#modal_property').after(link);
            });

            $('.modal_link').show();
            
        }else {
            $('.modal_link').hide();
        }
        
    }

})(jQuery); // End of use strict
