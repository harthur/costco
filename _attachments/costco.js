$(document).ready(function() {
  $("#map-function").val("function(doc) {\n\n}");
  $('#update-button').click(costco.mapDocs);
  $('#update-container').hide();
  
  $("#continue-button").click(function() {
    $("#status").text("updating docs...");
    costco.updateDocs(function() {
      $("#status").text('Docs successfully updated');
    });
    $('#update-container').hide();
  });

  $("#cancel-button").click(function() {
    $('#update-container').hide();
  });
});

var costco = {
  toUpdate : [],

  mapDocs : function() {
    var funcString = $("#map-function").val();
    eval("var editFunc = " + funcString);
    
    costco.toUpdate = [];
    var deleted = 0
      , edited = 0;

    costco.getDocs(function(data) {
      var rows = data.rows;
      rows.forEach(function(row) {
        var doc = row.doc;
        var updated = _.clone(doc);
        editFunc(updated); // mutate doc

        if(!updated) {
          doc._deleted = true;
          costco.toUpdate.push(doc);
          deleted++;
        }
        else if(!(_.isEqual(updated, doc))) {
          costco.toUpdate.push(updated);
          edited++;
        }
      });

      $("#status").text("about to edit " + edited
              + " docs and delete " + deleted + " docs");
      $("#update-container").show();
    });
  },

  updateDocs : function(callback) {
    if(!costco.toUpdate.length)
      return callback();

    $.couch.app(function(app) {
      app.db.bulkSave({docs: costco.toUpdate}, {
        success: callback,
        error: function(req, status, err) {
          alert('error bulk saving docs: ' + err);
        }
      });
    });
  },

  getDocs : function(callback) {
    $.couch.app(function(app) {
      app.db.allDocs({
        include_docs : true,
        success : callback,
        error: function(req, status, err) {
          alert('error retrieving docs: ' + err);
        }
      });
    });
  }
}
