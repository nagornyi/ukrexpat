$.ajaxSetup({
  xhrFields: {withCredentials: true},
  error: function(xhr, status, error) {
    $('.alert').removeClass('hidden');
    $('.alert').html("Status: " + status + ", error: " + error);
  }
});

var findTr = function(event) {
  var target = event.srcElement || event.target;
  var $target = $(target);
  var $tr =  $target.closest('.row');
  return $tr;
};

var remove = function(event) {
  var $tr = findTr(event);
  var id = $tr.data('id');
  $.ajax({
    url: '/api/events/' + id,
    type: 'DELETE',
    success: function(data, status, xhr) {
      $('.alert').addClass('hidden');
      $tr.remove();
    }
  })
};

var update = function(event) {
  var $tr = findTr(event);
  $tr.find('button').attr('disabled', 'disabled');
  var data = {
    published: $tr.hasClass('unpublished')
  };
  var id = $tr.attr('data-id');
  $.ajax({
    url: '/api/events/' + id,
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify({event: data}),
    success: function(dataResponse, status, xhr) {
      $tr.find('button').removeAttr('disabled');
      $('.alert').addClass('hidden');
      if (data.published) {
        $tr.removeClass('unpublished').find('.glyphicon-play').removeClass('glyphicon-play').addClass('glyphicon-pause');
      } else {
        $tr.addClass('unpublished').find('.glyphicon-pause').removeClass('glyphicon-pause').addClass('glyphicon-play');  
      }      
    }
  })
};

$(document).ready(function(){
  var $element = $('.admin');
  $element.on('click', 'button.remove', remove);
  $element.on('click', 'button.publish', update);
})