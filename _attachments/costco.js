$(document).ready(function() {
  $("#map-function").val("function(doc) {\n  \n  return doc;\n}");
  $("#map-function").focus().get(0).setSelectionRange(18, 18); 
  
  $("#update-button").click(costco.mapDocs);
  $("#update-container").hide();
  $("#status").click(function() {$("#status").empty()});
  
  $("#continue-button").click(function() {
    $("#status").text("updating docs...");
    costco.updateDocs(function() {
      $("#status").html("<span class='success'>Docs successfully updated</span>");
    });
    $("#update-container").hide();
  });

  $("#cancel-button").click(function() {
    $('#update-container').hide();
    $('#status').empty();
  });

  $.couch.allDbs({
    success: function(dbs) {
      dbs.forEach(function(db){
        $("<option></option>").val(db).html(db).appendTo("#db-select");
      });
      $.couch.app(function(app) {
        $('#db-select').val(app.db.name);
      });
    },
    error: function(req, status, err) {
      $("#status").html("<span class='error'>error fetching dbs: "
        + err + "</span>");
    }
  });
});

var costco = {
  toUpdate : [],
  
  getDb : function() {
    return $.couch.db($("#db-select").val());
  },

  mapDocs : function() {
    $("#status").html("<span>Computing changes...</span>");

    var funcString = $("#map-function").val();
    try {
      eval("var editFunc = " + funcString);
    } catch(e) {
      $("#status").html("<span class='error'>error evaluating function: "
        + e + "</span>");
      return;
    }

    costco.toUpdate = [];
    var deleted = 0
      , edited = 0
      , failed = 0;

    costco.getDocs(function(data) {
      var rows = data.rows;
      rows.forEach(function(row) {
        var doc = row.doc;
        try {
          var updated = editFunc(_.clone(doc));
        } catch(e) {
          failed++; // ignore if it throws on this doc
          return;
        }
        if(updated === null) {
          doc._deleted = true;
          costco.toUpdate.push(doc);
          deleted++;
        }
        else if(updated && !_.isEqual(updated, doc)) {
          costco.toUpdate.push(updated);
          edited++;
        }
      });
      // todo: make template for this
      $("#status").html("<span class='warning'>About to edit " + edited
              + " docs and delete " + deleted + " docs from "
              + costco.getDb().name  + "</span>");
      if(failed)
        $("#status").append(". Edit function threw on " + failed + " docs");
      $("#update-container").show();
    });
  },

  updateDocs : function(callback) {
    if(!costco.toUpdate.length)
      return callback();

    costco.getDb().bulkSave({docs: costco.toUpdate}, {
      success: callback,
      error: function(req, status, err) {
        $("#status").html("<span class='error'>error updating docs: "
           + err + "</span>");
      }
    });
  },

  getDocs : function(callback) {
    costco.getDb().allDocs({
      include_docs : true,
      success : callback,
      error: function(req, status, err) {
        $("#status").html("<span class='error'>error retrieving docs: "
           + err + "</span>");
      }
    });
  }
}
