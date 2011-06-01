#costo
[costco](http://harthur.github.com/costco) is a small UI for bulk editing CouchDB documents.

#install
costco is a [couchapp](http://couchapp.org), you can push it to any db:

	git clone http://github.com/harthur/costco.git
	cd costco
	couchapp push . http://hostname:5984/mydatabase

#usage
costco takes a map function and executes it on all the docs in the database. The map function should return the new doc that you'd like to replace the old one, or `null` if it should be deleted. Returning `undefined` does nothing to that doc.

An example map function that increments a field in all the docs and deletes some docs based on another field:

	function(doc) {
	  if(doc.text.length > 200)
	    return null;

	  doc.count++;
	  return doc;
	}
	
[More examples here](http://harthur.github.com/costco/#examples). Right now this **straight-up loads all the docs into memory**, some batch loading might come in the future.
