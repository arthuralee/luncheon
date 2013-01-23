$.mobile.buttonMarkup.hoverDelay = 0;

var app = {
    metadata : {
        'version' : '0.5'
    },

    populateMeta : function(metadata) {
        $.each(this.metadata, function(key, val) {
            $('.meta-' + key).html(val);
        });
    },

    setUser : function(id) {
        app.user = id;
        window.localStorage['luncheon-user'] = id;
    },

    updateList : function(data) {
        $('#list ul').empty(); // clear the list

        $.each(data, function(index,val){
            var listItem = $('<li>');
            val.phone = val.phone.toString().replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            $('<a>').attr('href','tel:' + val.phone)
                    .append('<img src="images/avatar.png" height="75px" />')
                    .append('<h3>' + val.nickname + '</h3>')
                    .append('<p class="ui-li-aside"><strong>' + val.phone + '</strong></p>')
                    .append('<p>' + val.status + '</p>')
                    .appendTo(listItem);
            $('#list ul').append(listItem);
        });
        $('#list ul').listview('refresh');
    },

    loadList : function(callback) {
        $.ajax({
            url: '/api/users/active',
            type: 'GET',
            data: {'id' : app.user},
            success: callback
        });
    },

    getloc : function(callback) {
        navigator.geolocation.getCurrentPosition(callback);
    },

    setActive : function() {
        var updateStatus = function(position) {
            $.ajax({
                url: '/api/users/active',
                type: 'POST',
                data: { id: app.user,
                        loc: [position.coords.latitude,
                             position.coords.longitude]}
            });
        };

        this.getloc(updateStatus);
    },

    setInactive : function() {
        $.ajax({
            url: '/api/users/inactive',
            type: 'POST',
            data: { id: app.user}
        });
    },

    finishSetup : function(data, callback) {
        $.ajax({
            url: '/api/users',
            type: 'POST',
            data: data,
            success : function(data) {
                app.setUser(data._id);
                callback();
            }
        });
    }

};



// ========= INITIAL PAGE LOADING ====
$(document).bind('pageinit', function() {
    $.mobile.autoInitializePage = false;
    if (window.localStorage['luncheon-user'])
        app.user = window.localStorage['luncheon-user'];

    if (!app.user) $.mobile.changePage($('#setup'));
    app.populateMeta();
});


// ========== SETUP =============
$(document).delegate('#form-setup', 'submit', function(){
    app.finishSetup($('#form-setup').serializeObject(), function(){
        $.mobile.changePage($('#launch'), {transition: 'slideup'});
    });
    return false;
});



// ========== LAUNCH ============
$(document).delegate('#launch', 'pageshow', function() {
    // do a refresh.
    // set looking to no, empty list
});

// =========== LIST ================
$(document).delegate('#list', 'pageinit', function() {
    $('#list-refresh').bind('tap', function(){
        app.loadList(app.updateList);
    });
    $('#list-end').bind('tap', function() {
        app.setInactive();
    });
    window.setInterval(function() {
        app.loadList(app.updateList);
    }, 5000);
});
$(document).delegate('#list', 'pagebeforeshow', function() {
    app.setActive();
    app.loadList(app.updateList);
});


// =========== SETTINGS =============
$(document).delegate('#settings', 'pageshow', function() {
});
$(document).delegate('#form-settings', 'submit', function(){
    $.mobile.changePage($('#launch'), {transition: 'slideup'});
    return false;
});
