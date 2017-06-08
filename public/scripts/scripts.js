$( document ).ready(function() {

	//Check registration form for validity as fields are populated
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
	//if all fields not null and passwords match...
	console.log('checking form');

	//Write this code better
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