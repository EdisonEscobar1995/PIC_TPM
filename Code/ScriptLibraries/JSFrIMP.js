$(function(){
	
	if (documento.sPrint == "Si"){
		var imp = "<a class='btn btn-mini' href='javascript:void(0)' onclick='fnImprimir(true)'><i class='icon-print icon-white'></i> Imprimir </a>"
		adaptarModal("Vista previa",imp);
		redimensionarModal(500);
	}
	
	self.setInterval("login()",1000 * 60 * 15);
	registerPartials(["hbDivAnexo",
	                  "hbTrDocumentoAsociados",
	                  "hbDivEnlaceAnexo", 
	                  "hbSelect", 
	                  "hbArbol"])
	SelectFromAjaxField("[name='colaboradores']", true, application.sWebDbName + 'agBuscarIntegrante?Open&clave=A');
	if ($("[name='accionesFuturas']").length > 0){
		$("[name='accionesFuturas']").on("change", function(){
			var mostrar = false
			$(this).find("option:selected").each(function(){
				if($(this).val().toLowerCase() == documento.replicaHorizontal.toLowerCase()){
					mostrar = true;
					return false;
				}
			})
			if (mostrar){
				$("#dDatosReplica").show()
			}else{
				$("#dDatosReplica").hide()
			}
		})	
	}
	if ($("[name='responsableReplica']").length > 0){
		SelectFromAjaxField("[name='responsableReplica']", false, application.sWebDbName + 'agBuscarPersonas?Open');
	}
	cargarAnexos(function(){
		cargarDatos();
	})
	
	if (documento.sPermiteAutoguardado == "Si" && 
		application.bEdicion && 
		parseInt(documento.sTiempoAutoguardado, 10) > 0 ) {
		var segundos = parseInt(documento.sTiempoAutoguardado, 10) * 60;
		var ms = segundos * 1000;
		setTimeout(function(){
			guardarDatos();
			document.forms[0].submit();
		},ms);
	}
})

function camposValidos(accion){
	var contador = 0;
	
	var aCampos = [];
	var aTipos = [];
	
	if ($("[name='sede']").length > 0){
		aCampos.push("sede");
		aTipos.push("text");
	}
	
	if (accion && accion == "GUARDAR"){
		aCampos.splice(aCampos, 0, "areaPEQ", "peq", "titulo");
		aTipos.splice(aTipos, 0, "text", "text", "text");
	}else{
		aCampos.splice(aCampos, 0, "areaPEQ", "peq", "titulo", "fechaCreacion", "categoriasPerdida", "despues", "costo", "beneficiosIntangibles", "beneficiosTangibles");
		aTipos.splice(aTipos, 0, "text", "text", "text", "text", "multi", "text", "text", "text", "text");
	
		$.each(documento.aCamposAValidar, function (){
			aCampos.push(this);
			if (this == "procesosProductivos" || this == "valida"){
				aTipos.push("multi");
			}else{
				aTipos.push("text");
			}
		})
	}
	
	contador += camposNoValidos(aCampos, aTipos, true);
		
	if (contador > 0){
		bAlert("Por favor, diligencie correctamente los campos indicados");
		return false;
	}
	return true;
}

function guardarDatos(){
	guardarDatosPEQ();
	
	 var docAsociados, cadena = [];

	 if (!application.bNuevo && $("#tblDocumentoAsociados tbody tr").length > 0) {
	        
	         $("#tblDocumentoAsociados tbody tr").each(function (index){
	             docAsociados = $(this);           
	             cadena.push(docAsociados.find("input[name='id']").val());           
	         })
	        
	     }

	 document.forms[0].idsAsociados.value = cadena;
	
	document.forms[0].tipoDocumento.value = "";
	document.forms[0].consecutivoBusqueda.value = "";
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
