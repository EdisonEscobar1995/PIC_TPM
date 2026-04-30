$(function(){
	var btn = "<a class='btn btn-mini' href='javascript:void(0)' onclick='guardarModal()'> Asociar </a>"
	adaptarModal("Asociación de documentos", btn);
	redimensionarModal();
	
	self.setInterval("login()",1000 * 60 * 15);
	registerPartials(["hbTblResultados", "hbTrResultados"]);
	
	$("[name='clave']").on("keypress", function(event){
		validarEnter(event, '.btn-buscar');
	})
	
	$("[name='formulario']").on("change", function(){
		if ($("[name='clave']").val() != ""){
			buscar()
		}else{
			$("#hits").html("0");
			$("#dResultados").empty();
		}
	})
	
	$(".contenedorCabezote").hide();
	$(".container").css("margin-top","0");
	
	$("#general").show();
	
})

//function cargarTablasDinamicas(){
function buscar(){
	
	var clave = $("[name='clave']").val()
	if (clave == ""){
		bAlert("Debe ingresar la clave de búsqueda");
		return false;
	}
	var vista = "vwBusqueda";
	var form = $("[name='formulario']").val();
	var nombreDoc = "";
	switch (form){
	case "frCAPDO":
		vista = "vwCAPDO";
		nombreDoc = "titulo";
		break;
	case "frHAN":
		vista = "vwHAN";
		nombreDoc = "titulo";
		break;
	case "frIMP":
		vista = "vwIMP";
		nombreDoc = "titulo";
		break;
	case "frLUP":
		vista = "vwLUP";
		nombreDoc = "titulo";
		break;
	case "frPEQ":
		vista = "vwPEQ";
		nombreDoc = "nombre";
		break;
	case "frPME":
		vista = "vwPME";
		nombreDoc = "titulo";
		break;
	case "frAccion":
		vista = "vwAccion";
		nombreDoc = "accionDescripcion";
		break;
	}
	
	var url = application.sWebDbName + "agBuscarDocumentos?Open"
									 + "&edit=" + (application.bEdicion ? "1" : "0")
									 + "&nombreDoc=" + nombreDoc
									 + "&form=" + form 
									 + "&vista=" + urlencode(vista)
									 + "&clave=" + urlencode(clave)			  
									 
									 
	$.getJSON(url, function(data){
		if (data.msgError == ""){
			
			if (data.resultados.length > 0 ) {
				$("#dResultados").html(documento.templateTblResultados(data));
				$("#hits").empty();
				$("#hits").append("<span>"+data.numRegistros+"</span>");
			}else{
				$("#hits").html("0");
				$("#dResultados").html("<span><strong>No se encontraron resultados</strong></span>")
			}			
			
		}else{
			location.href = application.sWebDbName + "frError?Open&msg=" + data.msgError
		}
	})
	.error(function(){
		location.href = application.sWebDbName + "frError?Open&msg=3"
	})	
}

function guardar() {
	var obj = {
		"seleccionados":[]
	}	
	var titulo;
	var i = 1;
	$("#dResultados input[type='checkbox']").each(function(){
		if ($(this).prop("checked")){
			titulo = $(this).attr("class").replace("check", "titulo");			
			obj.seleccionados.push({
				"id": $(this).val(),
				"indice": i,
				"titulo": $("."+titulo).text(),
				"enlace": "<a href='"+application.sWebDbName+"0/"+$(this).val()+"?Open' target='_blank'>Ver documento</a>"
			})
			i++;
		}
		
	})
	
	if (obj.seleccionados.length > 0) {
		if (parent.$("#tblDocumentosAsociados tbody tr").length <= 0){
			parent.$(".docAsociados").html(parent.documento.templateTblDocumentosAsociados(obj));
		}else{
			var tr;
			obj.seleccionados.forEach(function(val, i){				
				if (validarDocumento(val.id)){
					tr = parent.$("#tblDocumentosAsociados tbody tr:last-child");
					adicionarFila(tr, val);
				}				
			})
		}		
		parent.cerrarModal();
	}else{
		parent.bAlert("Debe seleccionar al menos un documento.")
	}	
		
}

function validarDocumento(id){
	var flag = true;
	parent.$("#tblDocumentosAsociados tbody input").each(function(){
		if ($(this).val() == id) {
			flag = false;
		}
	})	
	
	return flag;
}

function adicionarFila(tr, fila){
	tr.after(parent.documento.templatehbTrDocumentosAsociados([fila]));
	tr = tr.next("tr");		
}

function redimensionarModal(margen){
	if (!margen){
		margen = 0;
	}
	
	//parent.$('#ifModal').height(($("#general").height() + margen) +  "px")
	parent.$('#ifModal').height((400 + margen) + "px");
	parent.$("#dModal").css({"margin-top": "-280px"});
}
