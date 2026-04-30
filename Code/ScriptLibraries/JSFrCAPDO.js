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
	SelectFromAjaxField("[name='colaboradores'], [name='lider']", true, application.sWebDbName + 'agBuscarIntegrante?Open&clave=A');
	$("[name='aplicaReplica']").on("change", function(){
		if ($(this).val() == "Si"){
			$("#dLugarReplica").show();
		}else{
			$("#dLugarReplica").hide();
		}
	})
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

function camposValidos(){
	var contador = 0;
	
	var aCampos = [];
	var aTipos = [];
	
	if ($("[name='sede']").length > 0){
		aCampos.push("sede");
		aTipos.push("text");
	}
	
	aCampos.splice(aCampos, 0, "areaPEQ", "perdida", "fechaInicio", "fechaFin", "titulo", "beneficiosTangibles", "beneficiosIntangibles");
	aTipos.splice(aTipos, 0, "text", "text", "text", "text", "text", "text", "text");
	
	contador += camposNoValidos(aCampos, aTipos, true);
		
	if (contador > 0){
		bAlert("Por favor, diligencie correctamente los campos indicados");
		return false;
	}
	
	if (!ordenFechasValido($("[name='fechaInicio']").val(), "<=", $("[name='fechaFin']").val())){
		bAlert("La fecha de inicio no debe ser posterior a la fecha de fin");
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
