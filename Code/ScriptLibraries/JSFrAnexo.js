$(function(){
	adaptarModal("Anexo");
	$(".page-container").attr("align", "left");
	$(".container").width("100%")
	$(".input-append").css({"margin": "0px"});
	$("#cargador").attr("name",  $("#fileUpload").attr("name"));
	$("#general").show();
	$("[name='nombre']").focus();
	$("#cargador").on("change", function(){
		var nomArchivo = "";
		if(this.files.length > 0){			
			nomArchivo = this.files[0].name;	
		}
	});
})

function cargar(){
	if($.trim($("[name='nombre']").val()) == ""){
		top.bAlert("Debe ingresar el nombre");
		return false;
	}
	
	ruta = $("#cargador").val();
	if ($.trim(ruta) == ""){
		top.bAlert("Debe seleccionar el archivo a cargar");
		return false;
	}
	var reg = ""
	var extensionesValidas;
	switch(documento.sTipo){
	case "IMG":
		reg = /png|jpg|gif/g;
		extensionesValidas = "png, jpg o gif";
		break;		
	case "FLA":
		reg = /swf/g;
		extensionesValidas = "swf";
		break;
	case "VID":
		reg = /flv|mp4/g;
		extensionesValidas = "flv, o mp4";
		break;
	}
	if (reg != ""){
		ruta = ruta.substring(ruta.lastIndexOf(".") + 1, ruta.length).toLowerCase();
		if (!ruta.match(reg)){
			top.bAlert("Debe elegir un archivo con extensión " + extensionesValidas);
			return false;
		}
	}
	if(documento.sSeccion=="INFCOMP"){
		parent.$("#dSeguimientoInfoComple").next().next().remove();
	}
	$("#general").hide();
	$("#ajaxLoadingMessage").center();
	$("#ajaxLoadingMessage").show();
	document.forms[0].submit()
}