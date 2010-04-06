// ==========================================================================
// Project:   Comet - mainPage
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Comet */

// This page describes the main user interface for your application.  
Comet.mainPage = SC.Page.design({

  // The main pane is made visible on screen as soon as your app is loaded.
  // Add childViews to this pane for views to display immediately on page 
  // load.
  mainPane: SC.MainPane.design({
    childViews: 'messagesView'.w(),
    
    messagesView: SC.ListView.design({
      layout: { centerX: 0, top: 0, bottom: 0, width: 400},
      contentBinding: "Comet.messagesController.arrangedObjects",
      contentValueKey: 'message'
      
    })
  })

});
; if ((typeof SC !== 'undefined') && SC && SC.scriptDidLoad) SC.scriptDidLoad('comet');