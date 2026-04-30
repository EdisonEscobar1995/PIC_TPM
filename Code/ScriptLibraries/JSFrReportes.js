$(function(){
	$('.datepicker').datepicker({
		autoclose:true,
		language:'es'
	});
	$("#general").show();
})

function generar(){
	var aCampos = ["tipo", "fechaInicio", "fechaFin"];
	var aTipos = ["text", "text", "text"];
	            
	if (camposNoValidos(aCampos, aTipos, true) > 0){
		bAlert("Por favor, diligencie correctamente los campos indicados", function(){
			if (application.oCampoFocus){
				$(application.oCampoFocus).focus()
			}
		});
		return false;
	}
	if (!ordenFechasValido($("[name='fechaInicio']").val(), "<=", $("[name='fechaFin']").val())){
		bAlert("La fecha inicio debe ser anterior a la fecha fin");
		return false;
	}

	location.href = application.sWebDbName + "agReportes?Open"
										   + "&tipo=" + $("[name='tipo']").val()
										   + "&ubicacion=" + $("[name='ubicacion']").val()
										   + "&fei=" + $("[name='fechaInicio']").val() 
										   + "&fef=" + $("[name='fechaFin']").val()
										   + "&cedula=" + $("[name = cedula]").val()
}