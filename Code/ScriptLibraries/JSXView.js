$(function(){
	$("#dVista table").first().removeAttr("class");
	
	var url="frCabezote?ReadForm&id="+Math.random();
	
	$("#cabezote").load(url, function(response, status, xhr) {
		$("#general").show();
		if (status == "error") {
			bAlert("No se procesaron los datos, por favor intente más tarde.");
		}
	});
});