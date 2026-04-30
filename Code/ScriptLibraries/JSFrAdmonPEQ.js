$(function(){
	
	$("[name='permiteAutoguardado']").on("change", function(){
		if ($(this).val() == "Si") {
			$(".tiempoAutoGuardado").css("display", "block");
		}else{
			$(".tiempoAutoGuardado").css("display", "none");
		}
	});
	
	$("#general").show();
})

function guardar(){
	var aCampos = ["activarAA", "asuntoAA", "mensajeAA", "periodicidadAA"];
	var aTipos = ["text", "text", "text", "entero"];
	
	if ($("[name='permiteAutoguardado']").val() == "Si"){
		aCampos.push("tiempoAutoguardado");
		aTipos.push("entero");
	}	
	
	if (camposNoValidos(aCampos, aTipos, true) > 0){
		bAlert("Por favor, diligencie correctamente los campos indicados", function(){
			if (application.oCampoFocus){
				$(application.oCampoFocus).focus()
			}
		});
		return false;
	}
	
	document.forms[0].submit();
}