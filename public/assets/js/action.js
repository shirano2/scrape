$(function(){
    /* to scrape articles */
    $(document).on("click","#scrape",function(){
        $("h4").text("Please wait to load ....")
        $.ajax({
            method: "GET",
            url: "/scrape"
        }).then(function(){
            location.assign("/");
        })
    });

    /* to delete whole articles except for saved*/
    $(document).on("click","#clear",function(){
        $.ajax({
            method: "DELETE",
            url: "/clear"
        }).then(function(){
            location.assign("/");
        });
    });

    /* to save an article */
    $(".saved").on("click", function(){
        var thisId = $(this).data("id");
        var saved = $(this).data("saved");
        if (saved==="true") {
            $(this).attr("data-saved","false");
            saved="false";
        } else {
            $(this).attr("data-saved","true");
            saved="true";
        }
        $.ajax({
            method: "PUT",
            url: "/saved/" + thisId,
            data: {saved:saved}
        }).then(function() {
            location.assign("/");
        });
    });

     /* to show a form to make a note */
     $(".notes").on("click", function(){
        var thisId = $(this).data("id");
        var noteTitle= $(this).data("title");
        var noteBody= $(this).data("body");
        $("#hidden").val(thisId);
        $("#note").val(noteTitle);
        $("#body").val(noteBody);
        $("#exampleModal").modal("show");
    });

    /* to save a note */
    $("#submit").on("click", function(){
        $.ajax({
            method: "POST",
            url: "/note",
            data: {
                id:$("#hidden").val(),
                title:$("#note").val(),
                body:$("#body").val()
            }
        }).then(function(){
            location.assign("/saved");
        });
    });

    /* to delete an article from saved */
    $(".delete").on("click",function(){
        var thisId = $(this).data("id");
        $.ajax({
            method: "PUT",
            url: "/deleted/" + thisId
        }).then(function(){
            location.assign("/saved");
        });
    });
});