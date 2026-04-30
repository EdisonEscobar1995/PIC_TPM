$(function(){
	$("#general").show();
})

function guardar(){
	var aCampos = ["categoria","nombre"];
	var aTipos = ["text","text"];
	
	if (camposNoValidos(aCampos, aTipos, true) > 0){
		bAlert("Por favor, diligencie correctamente los campos indicados", function(){
			if (application.oCampoFocus){
				$(application.oCampoFocus).focus()
			}
		});
		return false;
	}
	validarClave(function(){
		document.forms[0].submit();
	});
}
