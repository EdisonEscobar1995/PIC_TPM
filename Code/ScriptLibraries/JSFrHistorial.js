$(function(){
	switch(application.sForm){
	case "frHistorial":
		adaptarModal("Historial");
		break;
	case "frHistorialUtilidad":
		adaptarModal("Registro de utilidad");
		break;
	}
	$("p").remove()
	$("#general").show();
})