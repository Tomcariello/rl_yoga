$( document ).ready(function() {

	//Check form for contents before submitting
	$('#contactSubmit').on('click',function() {
		
		if ($('#fname').val() != "") {
			$('#fname').removeClass('formWarning');
			if ($('#email').val() != "") {
				$('#email').removeClass('formWarning');
				if ($('#reason').val() != "--") {
					$('#reason').removeClass('formWarning');
					if ($('#message').val() != "") {
						$('#message').removeClass('formWarning');
						return true;
					} else{
						$('#message').addClass('formWarning');
					}
				} else {
					$('#reason').addClass('formWarning');
				}
			} else {
				$('#email').addClass('formWarning');
			}
		} else {
			$('#fname').addClass('formWarning');
		}
			
	return false;
	})

	//listen to registration form for validity as fields are populated
	$("#fname" ).change(function() {
	  validateRegistration();
	});

	$("#lname" ).change(function() {
	  validateRegistration();
	});

	$("#email" ).change(function() {
	  validateRegistration();
	});

	$("#password" ).change(function() {
	  validateRegistration();
	});

	$("#confirmpassword" ).change(function() {
	  validateRegistration();
	});

	$("#addnewproject" ).click(function() {
		$("#myModal").modal();
	});


	// $( "#adminAboutMForm" ).on( "submit", function( event ) {
	// 	var textareaValue = $('#summernoteAboutMe').summernote('code');
	// 	$("#AboutMeBio").val(textareaValue);

	// 	var data = $( this ).serialize();

	// 	return data;
	// });


});

function clearFields() {
  //Clear fields on contact form
  document.getElementById("fname").value = "";
  document.getElementById("email").value = "";
  document.getElementById("message").value = "";

  //Thank user for the message
  alert("Thank you for your message.")

}

function validateRegistration() {

	//Refactor this code
	if ($("#fname" ).val() != "") {
		if ($("#lname" ).val() != "") {
			$("#lname").css({"border-color":"initial"});
			if ($("#email" ).val() != "") {
				$("#email").css({"border-color":"initial"});
				if ($("#password" ).val() != "") {
					$("#password").css({"border-color":"initial"});
					if ($("#password" ).val() == $("#confirmpassword" ).val()) {
						$("#confirmpassword").css({"border-color":"initial"});
						//display submitButton
						$("#submitButton").css({"display":"inherit"});
					} else {
						$("#confirmpassword").css({"border":"1px solid red"});
						hideSubmitButton();
					}
				} else {
					$("#password").css({"border":"1px solid red"});
					hideSubmitButton();
				}
			} else {
				$("#email").css({"border":"1px solid red"});
				hideSubmitButton();
			}
		} else {
			$("#lname").css({"border":"1px solid red"});
			hideSubmitButton();
		}
	} else {
		$("#fname").css({"border":"1px solid red"});
		hideSubmitButton();
	}
}

function hideSubmitButton() {
	$("#submitButton").css({"display":"none"});	
}

//Listen to update biop page submit button
function validateUpdateBioForm(event) {

	var textareaValue = $('#summernoteAboutMe').summernote('code');
	$("#AboutMeBio").val(textareaValue);

	return true;
}