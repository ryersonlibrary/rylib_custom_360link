// This file is loaded in both sidebar pages and non-sidebar pages!

// Adds a [License Terms of Use] link if the provider is mapped in OURdb
jQuery(document).ready(function() {
  const API_BASE_URL = 'https://library.ryerson.ca/wp-json/rylib-api/v0';
  const API_ENDPOINT = 'licenses';

  var _$ = jQuery
  var _$resources = _$('.resource-row');

  function generateRequestUrl(resourceName) {
    return API_BASE_URL + '/' + API_ENDPOINT + '/?provider=' + resourceName;
  }

  _$.each( _$resources, function() {
    var resourceName = _$(this).find('.resource-name').text();
    var _$resource = _$(this);

    _$.get( generateRequestUrl(resourceName) )
    .done(function (data) {
      var licenseUri =  data['license']['license-uri'];
      _$resource.find('.invisible-link').after('<a style="margin-left:0.4rem" href="' + licenseUri + '" target="_blank">[License Terms of Use]</a>');
    });
  });
});

// Replaces chat button with chat box
jQuery(document).ready(function() {
  var _$ = jQuery;
  var _$button = _$('.chat-button').first();

  // Check if chat is available using LibraryH3lp presence API
  _$.get('https://ca.libraryh3lp.com/presence/jid/ryerson/chat.ca.libraryh3lp.com/text')
  .done(function(data){
    if ( data == 'unavailable') {
      _$button.replaceWith('');
    } else {
      var html = buildChatBoxHtml( _$button.attr('href') );
      _$button.replaceWith(html);
    }
  });

  var buildChatBoxHtml = function(iframeSrc) {
    var html = '';
    html += '<iframe frameborder="0" style="width:100%;height:350px;min-height:350px;resize:vertical;" src="' + iframeSrc + '"></iframe>';
    return html;
  };
});

// Customizing the BOTH the non-sidebar and sidebar pages using JavaScript hackery!
jQuery(document).ready(function() {
  var _$ = jQuery;
  _$('.email-action').text('Email Citation');
  _$('.export-action').text('Export Citation');
});

// Customizing the non-sidebar pages using JavaScript hackery!
jQuery(document).ready(function() {
  // Removes button styling on first result on non-sidebar pages
  var _$ = jQuery
  var _$resources = _$('.resource-row');

  var btnLink = _$resources.find("a").eq(0);

  // if the btn link is found, turn it into a regular link
  if (btnLink.length) {
    btnLink.removeClass("btn btn-primary btn-large");
    btnLink.addClass("full-text-link");
  }

  /* move "Report broken links" to the "Need Help?" section" */
  _$remove_el = _$('.report-problem').parent()
  _$('.report-problem').insertAfter( _$('.custom-link-space').last() ).wrap('<div id="report-broken-links" class="custom-link-space"></div>')
  _$remove_el.remove();
  _$('.btn-large').removeClass('btn-large');
});

/* Customizing the sidebar pages using JavaScript hackery! */
jQuery(document).ready(function() {
  var _$ = jQuery;
  var $sidebar = _$('.sidebar');

  /* add "Showing full text from:" heading to source-control */
  $sidebar.find('#source-control .link-for-screenreaders').prepend('<div style="font-size:110%; font-weight:700;">Showing full text from:</div>')

  /* add "Brought to you by:" before logo */
  $sidebar.find('.header').prepend('<div class="row-fluid" style="padding: 0 0.5em; margin-bottom: -0.5em;"><div class="span12">Brought to you by:</div></div>');

  /* move the citation buttons up to the citation section (duh) */
  _$('.sidebar .actions').appendTo( _$('.citation-data').parent() );
  _$('.sidebar .email-form').appendTo( _$('.citation-data').parent() );
  _$('.sidebar .email-confirmation').appendTo( _$('.citation-data').parent() );
  _$('.sidebar .export-form').appendTo( _$('.citation-data').parent() );

  /* move "Report broken links" to the "Need Help?" section" */
  _$('#link-not-working').unbind('click'); // unbind the click event

  _$('#link-not-working').on('click', function(event) { 
    // rebind the click event, removing all the garbage functionality.
    event.preventDefault();

    if (_$('.report-problem-form').is(':visible')) {
        _$('.report-problem-cancel').click();
        return false;
    }

    if ( _$(".report-problem-form").length ) {
      _$("#reportProblemName").val('');
      _$("#reportProblemEmail").val('');
      _$("#reportProblemMessage").val('');
      _$(".report-problem-form").show();
    } else {
      reportBadLink("Link Not Working");
      showReportProblemConfirmation();
    }
  });

  // actually move the element
  _$('#link-not-working').appendTo('.custom-links > div').wrap('<div id="report-broken-links" class="custom-link-space"></div>');

  // move the form into the same div so it appears in the right spot
  _$(".report-problem-form").appendTo("#report-broken-links");

  /**
    we need to copy reportBadLink() and showReportProblemConfirmation() from
    newUI-sidebar.js so that (hopefully) functionality doesn't break.
  */
  function reportBadLink(reportSource) {
    var badLink = _$('.selected-resource').val();
    _$("#badLink").val(badLink);
    _$("#reportSource").val(reportSource);
    _$("#linkType").val($('.selected-resource').data("link-type"));

    _$("#resourceName").val(_$.trim(_$('#source').text()));
    _$("#referringURL").val(window.location);
    _$.ajax({
        url: './logBadLink',
        type: 'POST',
        data: _$('#badLinkLoggingForm').serialize()
    }).done( function (response) {
        // console.log("Bad link was logged.");
    }).fail( function () {
        // console.log("There was an error logging a bad link.");
    });
  }
  
  function showReportProblemConfirmation() {
    _$('.bad-link-logging-confirmation').show();
    var linkText = _$("#link-not-working").offset();
    _$('.bad-link-logging-confirmation').offset({top:linkText.top+20, left:linkText.left-10});
    setTimeout("jQuery('.bad-link-logging-confirmation').hide()", 3000);
    setTimeout("jQuery('.custom-links, .locale, .additional-options, .actions').show()", 3000);
  }
});

// Expand the "Journal Details" panel by default only on the non-sidebar pages
// This requires some hackery and will likely break in the future.
// Basically we copy & modify code from newUI-common.js from serialssolutions
jQuery(document).ready(function() {
  _$ = jQuery;

  function replaceOnePixelCoverImageSidebar() {
    if ( _$("#syndetics-cover-image-sidebar").length > 0 && 
         _$("#syndetics-cover-image-sidebar").width() < 5) {
      _$("#syndetics").hide();
      _$("#replace-one-pixel-cover-image").show();
    }
  }
  
  function getUlrichsData() {
    var formData = _$('#ulrichsForm').serialize();
    _$.post( './ulrichJournalInfo', formData)
      .done( function(data) {
        setUlrichsData(data);
      })
      .fail( function() {
        console.log("ERROR getting Ulrichs data");
        $("#ulrichs-data-no").show();
        toggleJournalDetails();
      });
  }

  function setUlrichsData(data) {
    if (data != null && data.status === "Success") {
      var yes = _$("#yesLabel").val();
      var no = _$("#noLabel").val();		

      if (data.results.UlrichTitle[0].refereed) {
        _$("#ulrichsReviewed").text(yes);
      } else {
        _$("#ulrichsReviewed").text(no);
      }			

      if (data.results.UlrichTitle[0].openAccess) {
        _$("#ulrichsOpenAccess").text(yes);
      } else {
        _$("#ulrichsOpenAccess").text(no);
      }

      var description = data.results.UlrichTitle[0].description || "&nbsp;";
      var frequency = data.results.UlrichTitle[0].frequency || "&nbsp;";
      var country = data.results.UlrichTitle[0].country || "&nbsp;";
      _$("#ulrichsDescription").html(description);
      _$("#ulrichsFrequency").html(frequency);
      _$("#ulrichsCountry").html(country);
      _$("#ulrichsSubjects").html("&nbsp;");
      _$("#ulrichsLanguages").html("&nbsp;");
      _$("#ulrichsContentTypes").html("&nbsp;");
      var subjectLength = data.results.UlrichTitle[0].subject.length;
      _$.each(data.results.UlrichTitle[0].subject, function( index, value ) {
        _$("#ulrichsSubjects").append(value);
        if (index < subjectLength - 1) {
          _$("#ulrichsSubjects").append(", ");
        }
      });
      var languagesLength = data.results.UlrichTitle[0].languages.length;
      _$.each(data.results.UlrichTitle[0].languages, function( index, value ) {
        _$("#ulrichsLanguages").append(value);
        if (index < languagesLength - 1) {
          _$("#ulrichsLanguages").append(", ");
        }
      });
      var contentTypesLength = data.results.UlrichTitle[0].contentTypes.length;
      _$.each(data.results.UlrichTitle[0].contentTypes, function( index, value ) {
        _$("#ulrichsContentTypes").append(value);
        if (index < contentTypesLength-1) {
          _$("#ulrichsContentTypes").append(", ");
        }
      });	
      _$("#ulrichs-data-yes").show();
    } else {
      _$("#ulrichs-data-no").show();
    }
    toggleJournalDetails();
  }

  function toggleJournalDetails() {
    _$('#ulrichs-header').next().next().slideToggle("fast", function() {
      _$('.ulrichs-open').toggle();
      _$('.ulrichs-close').toggle();
    });
    replaceOnePixelCoverImageSidebar();
    _$('#ulrichs-spinner').hide();
  }

  // Really dumb way to determine if we are on a non-sidebar page
  if ( _$('#mobile-main-page').length > 0) {
    // _$('#ulrichs-control').remove();
    getUlrichsData();
  }
});

/* 
  Add custom styles by injecting a <style> element at the bottom of <head>
  because it's too painful to modify _all_ the weird styles using jQuery.
*/
document.addEventListener("DOMContentLoaded", function(event) {
  var styles = '';

  /* Common styles to sidebar and non-sidebar pages */
  styles += ' body { background-color: #F3F3F5; font-family: Arial, sans-serif; }';
  styles += ' select, textarea, input[type="text"], input[type="password"], input[type="datetime"], input[type="datetime-local"], input[type="date"], input[type="month"], input[type="time"], input[type="week"], input[type="number"], input[type="email"], input[type="url"], input[type="search"], input[type="tel"], input[type="color"], .uneditable-input, .btn { border-radius: 0!important; }';
  styles += ' input, textarea, select { width: 100%; box-sizing: border-box; }';
  styles += ' input[type="file"], input[type="image"], input[type="submit"], input[type="reset"], input[type="button"], input[type="radio"], input[type="checkbox"] { width: auto; }';
  styles += ' .actions { padding: 6.5px; margin-top: 0; }';
  styles += ' .resource-description-button { padding-top: 0; }';
  styles += ' .resource-description-button { padding-top: 0; }';
  styles += ' .title { font-weight: 700; }';

  // ulrichs-data dropdown
  styles += ' .ulrichs-label { font-size: 100%; font-weight: 700; }';
  styles += ' .ulrichs-link { padding: 10px 0; }';
  styles += ' .sidebar #ulrichs-data { margin: 10px 0 0 0; }';

  // Sidebar: sidebar section dividers
  styles += ' .sidebar .section { border-bottom: 2px solid #4FBEF0 }';
  
  // Sidebar: Email citation form
  styles += ' .sidebar .email-form { width: 100%; box-sizing: border-box; }';
  
  // Sidebar: Export citation form
  styles += ' .sidebar .export-form { width: 100%; box-sizing: border-box; }';
  
  // Sidebar: Report problem form
  styles += ' .sidebar .report-problem-form { width: 100%; box-sizing: border-box; }';
  
  // Sidebar: remove bolding from "Also available online from:" dropdown header
  styles += ' #source-menu-header { font-weight: 400; }';
  
  // Non-sidebar: general tweaks
  styles += ' #mobile-main-page .title { margin-bottom: 10px; }';
  styles += ' #mobile-main-page .looking-for-label { margin-bottom: 10px; }';
  styles += ' #mobile-main-page .full-text-link { margin-left: 0; margin-right: 0; }';
  styles += ' #mobile-main-page .section { padding: 0.5em 0; border-bottom: 2px solid #4FBEF0; }';
  styles += ' #mobile-main-page .single-results, #mobile-main-page .custom-links { margin-top: 0; }';
  styles += ' #mobile-action-page #syndetics, #mobile-action-page #no-cover-image, #mobile-action-page #replace-one-pixel-cover-image { margin: 10px auto; }';
  styles += ' #mobile-action-page .actions { margin: 0; }';
  
  // Non-sidebar: Report problem form
  styles += ' #mobile-main-page .report-problem-form { margin: initial; }';
  
  // Non-sidebar: "custom links rectangle...?"
  styles += ' #mobile-main-page .custom-links-rectangle { background: #fff; border-radius: 0; }';

  injectStyles(styles);

  function injectStyles(styles) {
    var css = document.createElement('style');
    css.type = 'text/css';
    
    if (css.styleSheet) {
      css.styleSheet.cssText = styles;
    } else {
      css.appendChild(document.createTextNode(styles));
    }

    document.getElementsByTagName("head")[0].appendChild(css); 
  }
});
