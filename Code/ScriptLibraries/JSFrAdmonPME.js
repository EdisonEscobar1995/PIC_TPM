$(function(){
	
	$("[name='permiteAutoguardado']").on("change", function(){
		if ($(this).val() == "Si") {
			$(".tiempoAutoGuardado").css("display", "block");
		}else{
			$(".tiempoAutoGuardado").css("display", "none");
		}
	});
	
	SelectFromAjaxField("[name = 'maestroRedApoyo']", true, application.sWebDbName + 'agBuscarIntegrante?Open&clave=A');
	$("#general").show();
})

function guardar(){
	if ($("[name = 'aplicaRedApoyo']").val() == "Si"){
		if ($("[name = 'maxRedApoyo']").val() != ""){
			aCampos = ["maxRedApoyo","maestroRedApoyo"]
	   		aTipos = ["entero","text"]
	   		if (camposNoValidos(aCampos, aTipos, true) > 0){
	   			bAlert("Por favor, diligencie correctamente los campos indicados", function(){
	   			if (application.oCampoFocus){
	   				$(application.oCampoFocus).focus()
	   			}
	   		});
	   		return false;
	   		}
		}		
	}else{
		$("[name = 'maxRedApoyo']").val("")
		$("[name = 'maestroRedApoyo']").val([])
	}
	document.forms[0].submit();
}