// Contains the scrapers for gathering information from the page. This will be replaced with a backend system down
// the line. 

var scrape = {

    ///////////////////////////////////
    // Functions for extracting content
    ///////////////////////////////////
    return_title: function(metas) {
        for (i=0; i<metas.length; i++) {
            if (metas[i].getAttribute("name") == "citation_title") {
                return metas[i].getAttribute("content");
            }
        }
    },

    return_doi: function(metas) {
        for (i=0; i<metas.length; i++) {
            if (metas[i].getAttribute("name") == "citation_doi") {
                return metas[i].getAttribute("content");
            }
        }
    },

    return_authors: function(metas) {
        var authors = [];
        for (i=0; i<metas.length; i++) {
            if (metas[i].getAttribute("name") == "citation_author") {
                var authname = metas[i].getAttribute("content");
                authors.push( { name: authname } );
            }
        }
        return authors;
    },

    return_author_email: function(metas) {
        var authors = [];
        for (i=0; i<metas.length; i++) {
            if (metas[i].getAttribute("name") == "citation_author_email") {
                var email = metas[i].getAttribute("content");
                authors.push(email);
            }
        }
        return authors;
    },

    return_journal: function(metas) {
        for (i=0; i<metas.length; i++) {
            if (metas[i].getAttribute("name") == "citation_journal_title") {
                var jtitle = metas[i].getAttribute("content");
                return { name: jtitle }
            }
        }
    },

    scrape_emails: function() {
        var all_emails = document.documentElement.innerHTML.toLowerCase().match(/([a-z0-9_\.\-\+]+@[a-z0-9_\-]+(\.[a-z0-9_\-]+)+)/g);
        if (all_emails == null) {
            return("emails", []);
        } else {
            var emails = [];

            for (var i=0; i<all_emails.length; i++) {
                var email = all_emails[i];
                if (!((email.indexOf("@elsevier.com") > -1) || (email.indexOf("@nature.com") > -1) || (email.indexOf("@sciencemag.com") > -1) || (email.indexOf("@springer.com") > -1))) {
                    emails.push(email);
                }
            }
            return("emails", emails);
        }
    }
};