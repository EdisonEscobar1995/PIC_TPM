$(function(){
	
	if (documento.sPrint == "Si"){
		var imp = "<a class='btn btn-mini' href='javascript:void(0)' onclick='fnImprimir(true)'><i class='icon-print icon-white'></i> Imprimir </a>"
		adaptarModal("Vista previa",imp);
		redimensionarModal(500);
	}
	
	self.setInterval("login()",1000 * 60 * 15);	
	registerPartials(["hbTblDocumentosAsociados", "hbDivAnexo", "hbDivEnlaceAnexo", "hbTrDocumentosAsociados"]);
	SelectFromAjaxField("[name='responsables']", false, application.sWebDbName + 'agBuscarPersonas?Open&dir=all');
	
	if (application.bEdicion){
		$('.datepicker').datepicker({
			autoclose:true,
			language:'es'
		});
	}
		
	$(".camposTabla table").hide();
	$(".camposTabla tr").hide();
	
	if (documento.sPrint == "Si"){
		fnImprimir();
		$("#general").show();
		setTimeout(function(){ 
			fnImprimir(true); 
		},400);
	}else{
		cargarAnexos(function(){
			cargarDatos();
		});
	}	
})

function camposValidos(){
	var contador = 0;
	
	var aCampos = [];
	var aTipos = [];
	
	aCampos = aCampos.concat(documento.aCamposValidar);
	aTipos = aTipos.concat(documento.aTiposValidar);
	
	contador += camposNoValidos(aCampos, aTipos, true);
		
	if (contador > 0){
		bAlert("Por favor, diligencie correctamente los campos indicados");
		return false;
	}
	
	return true;
}

function setCampos(data) {
	var tr = "";
	var table = "";
	var name = "";
	var campo = "";
	if (data.fields.length > 0) {				
		$.each(data.fields, function (i, value){
			campo = value.campo.toLowerCase();
			tr = $(":input").filter(function(){
				name = "";
				name = this.name;
				if (this.name.toLowerCase() == campo){
					
					if (value.requerido == "Si") {
						documento.aCamposValidar.push(name);
						documento.aTiposValidar.push("text");
					}				 
				}
				
				return this.name.toLowerCase() == campo;
				
			}).parents("tr");
			
			if ($(tr).length > 0) {
				table = $(tr).parents("table");		
				
				table.show();
				tr.show();
			}
		})
	}else {
		$(".camposTabla table").hide();
		$(".camposTabla tr").hide();
	}
}

function cargarDatos(){
	var url = application.sWebDbName + "agCargarFormAccion?Open" 
									 + "&edit=" + (application.bEdicion ? "1" : "0") 
									 + "&unique=" + application.sUnique 
									 + "&form=" + application.sForm
	$.getJSON(url, function(data){
		if (data.msgError == ""){
			
			setAyudas(data);
			setLabels(data);
			if (data.fields.length > 0 && documento.sPosEstado == "F"){				
				data.fields.push({"Show":"Si","campo":"verificacionEficacia","requerido":"No"});								
			}		
			setCampos(data);
			
			if (data.seleccionados.length > 0 ) {
				$(".docAsociados").html(documento.templateTblDocumentosAsociados(data));
			}
			
			if(documento.modal){
				var botones = "";
				if(application.bEdicion){
					botones = "<a class='btn btn-mini margin' href='javascript:void(0)' onclick='guardarModalAccion(\"btnGuardar\")'><i class='icon-save icon-white'></i> Guardar </a>";
					if($(".btnAvanzar").length > 0 && documento.sPosEstado == "I"){
						botones += "<a class='btn btn-mini margin' href='javascript:void(0)' onclick='guardarModalAccion(\"btnAvanzar\")'><i class='icon-arrow-right icon-white'></i> " + $(".btnAvanzar").text() + " </a>";						
					}
				}
				
				if(documento.sPosEstado != "I"){
					botones += "<a class='btn btn-mini margin' href='"+application.sWebDbName+"0/"+application.sUnid+"' target='_blank'><i class='icon-share icon-white'></i> Abrir acción </a>"		
				}
				
				adaptarModal("<br>", botones);
				$(".cabeza").hide();
			}
			
			$("#general").show();
			if(documento.modal){
				redimensionarModalAccion();
				parent.hideLoading();
			}
		}else{
			location.href = application.sWebDbName + "frError?Open&msg=" + data.msgError
		}
	})
	.error(function(){
		location.href = application.sWebDbName + "frError?Open&msg=3"
	})	
}

function guardarDatos(){
	
	if ($("#tblDocumentosAsociados tbody tr").length > 0) {
		
		var docAsociados, cadena = [];
		
		$("#tblDocumentosAsociados tbody tr").each(function (index){
			docAsociados = $(this);			
			cadena.push(docAsociados.find("input").val());			
		})
		document.forms[0].idsAsociados.value = cadena;
		
	}
	guardarDatosPEQ();
}

function fnImprimir(imp) {
	if (imp) {
		var target = parent.top.document.getElementById('ifModal');			
		try{
			target.contentWindow.document.execCommand('print', false, null);
		}catch(e){
			target.contentWindow.print();
		}
	}else{
				
		$(".btn").remove();
		$(".contenedorCabezote").remove();
		$(".icon-remove").remove();
		
		$(".cabeza").css({"position": "absolute", "top": "0"});
		$(".container").css("margin-top","6.5%");		
		$("input[type=radio]").prop("disabled",true);			
	}	
	
}

function asociarDocumentos(){
	var url = application.sWebDbName+"frAsociacion?Open&asociar=Si";
	var tipoModal = documento.modal ? "modalLarge1": "modalLarge";
	abrirModalLarge(url, tipoModal);
}

function eliminarFila(obj){
	bConfirm("¿Confirma que desea desvincular el documento?",function(response){
		if(response){
			var table = $(obj).parents("table").first();
			var tr = $(obj).parents("tr").first();
			if (tr.siblings().length == 0){
				tr.find("input, select").each(function (){
					$(this).val("");
				})
				tr.find("select[multiple]").each(function (){
					$(this).val([]);
				})
				
				tr.find(".aviso").remove();				
				tr.find("select").select2({placeholder: "Buscar", allowClear: true});
			}else{
				tr.remove()
			}
						
		}
	});
}

function redimensionarModalAccion(){
	parent.$('#ifModal').height(($(".container").height() + 30) +  "px");
}