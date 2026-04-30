$(function(){
	$("[name='certificacion']").on("change",function(){
		getTipoCertificaciones();
	});
	SelectFromAjaxField("[name='certificadores']", true, application.sWebDbName + 'agBuscarPersonas?Open&contratistas=Si&nomina=Si&tag=Si');
	$("#general").show();
})

function getTipoCertificaciones(){
	var url = "xaServicios.xsp?Open&accion=getTipoCertificaciones"
			+ "&certificacion=" + $("[name='certificacion']").val()
			+ "&id=" + Math.random();
	$.getJSON(url, function(data) {
		setTipoCertificaciones(data);
	});
}

function setTipoCertificaciones(data){
	var tiposCertificaciones = $("[name='tipoCertificacion']")
	tiposCertificaciones.find("option").remove();
	tiposCertificaciones.append("<option value=''></option>")
	for (var i = 0; i < data.tipoCertificaciones.length; i++){
		tiposCertificaciones.append("<option value='"+data.tipoCertificaciones[i].codigo+"'>"+data.tipoCertificaciones[i].nombre+"</option>")
	}
	tiposCertificaciones.val("");
	tiposCertificaciones.select2({
		placeholder : "",
		allowClear : true
	});
}

function guardar(){
	var aCampos = ["certificacion", "tipoCertificacion", "aplicaValidacionEvaluacion", "nombre", "certificadores"];
	var aTipos = ["text", "text", "text", "text", "text"];
	      
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
		$("[name='nomTipoCertificacion']").val($("[name='tipoCertificacion'] option:selected").text());
		document.forms[0].submit();
	});
}