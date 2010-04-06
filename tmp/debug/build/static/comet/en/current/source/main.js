// ==========================================================================
// Project:   Comet
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Comet */

// This is the function that will start your app running.  The default
// implementation will load any fixtures you have created then instantiate
// your controllers and awake the elements on your page.
//
// As you develop your application you will probably want to override this.
// See comments for some pointers on what to do next.
//
Comet.main = function main() {
  
  var lastTimeAsked = null;
  var getMessages = function(lastTimeAsked) {
    var newTimeAsked = Date.now();
    SC.Request.getUrl('/messages?' + (lastTimeAsked || ""))
        .set('isJSON', YES)
        .notify(this, notifyMethod)
        .send();
    return newTimeAsked;
    console.log(lastTimeAsked);
  };

  var notifyMethod =  function(response, params) {
    if (SC.ok(response)) {
      var data = response.get('body');
      Comet.store.loadRecords(Comet.Message, data.isEnumerable ? data : [data]);
      console.log(response.get('body'));
      lastTimeAsked = getMessages(lastTimeAsked);
    } else {
      // handle the error
    };
  };

  lastTimeAsked = getMessages(lastTimeAsked);
      
  messages = Comet.store.find(Comet.Message);
  Comet.messagesController.set('content', messages);
  // Step 1: Instantiate Your Views
  // The default code here will make the mainPane for your application visible
  // on screen.  If you app gets any level of complexity, you will probably 
  // create multiple pages and panes.  
  Comet.getPath('mainPage.mainPane').append() ;

  // Step 2. Set the content property on your primary controller.
  // This will make your app come alive!

  // TODO: Set the content property on your primary controller
  // ex: Comet.contactsController.set('content',Comet.contacts);
} ;

function main() { Comet.main(); }
; if ((typeof SC !== 'undefined') && SC && SC.scriptDidLoad) SC.scriptDidLoad('comet');