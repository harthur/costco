#costo
costco is a small UI for bulk editing CouchDB documents. It takes a map function and executes it on all the docs in the database.


#install
costco is a [couchapp](http://couchapp.org), you can push it to any db:

	git clone http://github.com/harthur/costco.git
	cd costco
	couchapp push . http://hostname:5984/mydatabase


#use
The map function should return the new doc that you'd like to replace the old one, or `null`/`undefined` if it should be deleted. An example map function that increments a field in all the docs and deletes some docs based on another field:
	function(doc) {
	  if(doc.text.length > 200)
	    return null;

	  doc.count++;
	  return doc;	
	}
	
[More examples here](http://harthur.github.com/costco/#examples). Right now this **straight-up loads all the docs into memory**, some batch loading might come in the future.
