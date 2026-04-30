$(function(){
	SelectFromAjaxField("[name='administradorPlantilla']", true, application.sWebDbName + 'agBuscarPersonas?Open');
	
	$(".container").css("width","98%");
	$(".cabeza").css("width","99%");
	$(".cabeza .botones").css("right","40px");
	
	$("#general").show();
})

function guardar(){
	document.forms[0].submit();
}