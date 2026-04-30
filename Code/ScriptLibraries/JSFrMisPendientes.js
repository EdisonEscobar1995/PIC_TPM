$(function(){
	registerPartials(["hbDatos", "hbTblCertificaciones"]);

	if(documento.showCERT == "Si"){
		var url = application.sWebDbName+"xaServicios.xsp?Open&accion=cargarCertificacionesPendientes&usuario="+application.sUsuarioAbbreviate+"&id=" + Math.random();
		$.getJSON(url, function(data){
			if (data.error == ""){
				$("#vista").css("position", "static");
				$("#certificaciones").html(documento.templateDatos(data));
			}else{
				bAlert(data.error)
			}
		})
		.error(function(){
			location.href = application.sWebDbName + "frError?Open&msg=3"
		})		
	}
})