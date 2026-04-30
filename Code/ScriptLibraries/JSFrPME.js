$(function(){
	self.setInterval("login()",1000 * 60 * 15);
	registerPartials(["hbDivAnexo", 
	                  "hbTrDocumentoAsociados",
	                  "hbDivEnlaceAnexo", 
	                  "hbSelect", 
	                  "hbArbol"])
	SelectFromAjaxField("[name='colaboradores']", true, application.sWebDbName + 'agBuscarIntegrante?Open&clave=A');
	if (documento.sAplicaRedApoyo == "Si"){
		$("[name = redApoyo]").select2({
			maximumSelectionSize : documento.nMaxRedApoyo 
		})
	}	
	$("[name='aplicaReplica']").on("change", function(){
		if ($(this).val() == "Si"){
			$("#dLugarReplica").show();
		}else{
			$("#dLugarReplica").hide();
		}
	})
	if (documento.sUnidCostoBeneficio != ""){
		enlazarBeneficio(documento.sUnidCostoBeneficio,documento.sConsecutivoBen)
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

function camposValidos(){
	var contador = 0;
	
	var aCampos = [];
	var aTipos = [];
	
	if ($("[name='sede']").length > 0){
		aCampos.push("sede");
		aTipos.push("text");
	}
	
	aCampos.splice(aCampos, 0, "areaPEQ", "titulo");
	aTipos.splice(aTipos, 0, "text", "text");
	
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

function enlazarBeneficio(unid,consecutivo){
	if (unid != ""){
		var url = "/"+application.sRutaCostoBen+"/0/"+unid+"?Open&tipo=TP&modal=true&accion=modal&id="+Math.random();
		$("#enlaceBeneficio").html("<a  href='javascript:void(0)' onclick='abrirModalLarge(\""+url+"\",\"modalLarge\")' >ver costo beneficio ("+consecutivo+")</a>")
	}else{
		$("#enlaceBeneficio").empty();
	}
}

function setRedApoyo(campo){
	$("[name='"+campo+"']").select2({
		maximumSelectionSize : documento.nMaxRedApoyo 
	})
}

