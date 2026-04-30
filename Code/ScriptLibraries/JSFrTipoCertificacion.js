$(function(){
	$("#general").show();
})

function guardar(){
	var aCampos = ["certificacion", "nombre"];
	var aTipos = ["text", "text"];
	      
	if (camposNoValidos(aCampos, aTipos, true) > 0){
		bAlert("Por favor, diligencie correctamente los campos indicados", function(){
			if (application.oCampoFocus){
				$(application.oCampoFocus).focus()
			}
		});
		return false;
	}
	
	validarClave(function(){
		$("[name='nomCertificacion']").val($("[name='certificacion'] option:selected").text());
		document.forms[0].submit();
	});
}