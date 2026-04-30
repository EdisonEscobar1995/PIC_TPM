function cargarDatos(callback){
	var url = application.sWebDbName + "agCargarFormAsociado?Open&edit=" + (application.bEdicion ? "1" : "0") + "&unique=" + application.sUnique + "&form=" + application.sForm + "&sede=" + urlencode(documento.sSede) + "&area=" + urlencode(documento.sArea) + "&uniquePEQ=" + documento.sUniquePEQ + "&peq=" + urlencode(documento.sPEQ)
	$.getJSON(url, function(data){
		if (data.msgError == ""){
		
			$("[name='sede']").on("change", function(){
				changeSede(this);
			})
			
			documento.aIntegrantes = data.integrantes;
			agregarExIntegrantes(documento.aParticipantes);
			
			if (application.sForm == "frLUP"){
				cargarDatosEntrenamientos(data)
			}
			
			cargarDatosSede(data);
			
			if (application.bEdicion){
				$('.datepicker').datepicker({
					autoclose:true,
					language:'es'
				});
				
				$("[name='numeroAccion']").on("keypress", function(event){
					validarEnter(event, '.btn-buscarAccion')
				}).on("blur", function(event){
					//buscarAccion();
				})
			
				if (application.sForm == "frHAN"){
					$("#dEstructura [type='radio']").each(function(){
						if(this.value == documento.sMaquina){
							$(this).attr("checked", true)
							return false;
						}
					})
				}
				
				setAyudas(data);
			}		
			
			/*if (documento.sUnidAccion != ""){
				enlazarAccion()
			}*/
			
			if (documento.sUnidsAcciones != ""){
				enlazarAccion()
			}			
			
			if(documento.sPrint != "Si"){
				if (data.asociados.length > 0) {
					$("#dDocumentosAsociados").html(documento.templateTblDocumentosAsociados(data));
				}
			}
			
			if (callback){
				callback()
			}else{
				$("#general").show();
				
				if (documento.sPrint == "Si") {
					fnImprimir();			
					setTimeout(function(){ 
						fnImprimir(true); 
					},300);
				}				
			}			
		}else{
			location.href = application.sWebDbName + "frError?Open&msg=" + data.msgError
		}
	})
	.error(function(){
		location.href = application.sWebDbName + "frError?Open&msg=3"
	})	
}

function cargarDatosSede(data){
	$("#dArea").html(documento.templateSelect({nombre:"areaPEQ", valores:[documento.sArea], opciones:data.areas}));
	$("[name='areaPEQ']").addClass("input-xxlarge").select2({placeholder: "Buscar", allowClear: true});
	addOnChange("[name='areaPEQ']");
	cargarDatosArea(data);
}

function cargarDatosArea(data){
	if ($("[name='areaPEQ']").val() != ""){
		data.peqs.push({"nombre":"Otro", "valor":"Otro"})
	}
	$("#dPEQ").html(documento.templateSelect({nombre:"peq", valores:[(application.bEdicion ? documento.sUniquePEQ : documento.sPEQ)], opciones:data.peqs}));		
	$("[name='peq']").addClass("input-xxlarge").select2({placeholder: "Buscar", allowClear: true});
	/*if (application.bEdicion) {
		$("#dEquiposColaboranHAN").html(documento.templateSelect({nombre:"equiposAnalisis", valores:[(application.bEdicion ? documento.sEquipoColaboraUniquePEQ : documento.sEquipoColaboraPEQ)], opciones:data.peqs}));
		$("[name='equiposAnalisis']").addClass("input-xxlarge").select2({placeholder: "Buscar", allowClear: true});
	}*/		
	addOnChange("[name='peq']");
	cargarDatosPEQ(data);
}

function cargarDatosPEQ(data){
	$("#dIntegrantes").html(documento.templateSelect({nombre:"integrantes", tipo:"multiple", valores:documento.aParticipantes, opciones:documento.aIntegrantes}));
	$("[name='integrantes']").addClass("input-xxlarge").select2({placeholder: "Buscar", allowClear: true});
	$("[name='integrantes']").parents("td").find(".aviso").remove();
	setSelect2MultiValue("[name='integrantes']");
	if (application.sForm == "frHAN"){
		if (application.bEdicion){
			$("#dEstructura").html(documento.templateArbol(data.estructura));
			$("#dEstructura [type='radio']").on("change",function(){
				documento.sMaquina = this.value;
			});
		}else{
			$("#dEstructura").html(documento.sMaquina)
		}
	}
}

function changeSede(obj){
	if (documento.sSede != ""){
		bConfirm("¿Confirma que desea modificar la sede?",function(response){
			if(response){
				cambiarSede(obj.value);
            }else{
				obj.value = documento.sSede;
			}
		});
	}else{
		cambiarSede(obj.value);
	}
}

function cambiarSede(sede){
	documento.sSede = sede;
	documento.sArea = "";
	documento.sUniquePEQ = "";
	documento.sPEQ = "";
	var url = application.sWebDbName + "agCargarDatosSede?Open&sede=" + urlencode(documento.sSede); 
 	$.getJSON(url, function(data){
		if (data.msgError == ""){
			documento.aIntegrantes = [];
			documento.aParticipantes = [];
			cargarDatosSede(data)
		}else{
			bAlert(data.msgError);
		}
	})
	.error(function(){
		bAlert("No se procesaron los datos. por favor intente más tarde");
	})	
}

function changeArea(obj){
	documento.sArea = obj.value;
	documento.sUniquePEQ = "";
	documento.sPEQ = "";
	var url = application.sWebDbName + "agCargarDatosArea?Open&form=" + application.sForm + "&sede=" + urlencode(documento.sSede) + "&area=" + urlencode(documento.sArea); 
 	$.getJSON(url, function(data){
		if (data.msgError == ""){
			documento.aIntegrantes = [];
			documento.aParticipantes = [];
			cargarDatosArea(data)
		}else{
			bAlert(data.msgError);
		}
	})
	.error(function(){
		bAlert("No se procesaron los datos. por favor intente más tarde");
	})	
}

function changePEQ(obj){
	documento.sUniquePEQ = obj.value;
	documento.sPEQ = $(obj).find("option:selected").text();
	var url = application.sWebDbName + "agCargarDatosPEQ?Open&form=" + application.sForm + "&sede=" + urlencode(documento.sSede) + "&area=" + urlencode(documento.sArea) + "&uniquePEQ=" + documento.sUniquePEQ + "&peq=" + urlencode(documento.sPEQ); 
 	$.getJSON(url, function(data){
		if (data.msgError == ""){
			documento.aIntegrantes = data.integrantes;
			documento.aParticipantes = [];
			$.each(documento.aIntegrantes, function(){
				documento.aParticipantes.push(this.valor)
			})
			cargarDatosPEQ(data);
		}else{
			bAlert(data.msgError);
		}
	})
	.error(function(){
		bAlert("No se procesaron los datos. por favor intente más tarde");
	})	
}

function guardarDatosPEQ(){
	$("[name='area']").val($("[name='areaPEQ']").val())
	if ($("[name='integrantes']").val()){
		$("[name='participantes']").val($("[name='integrantes']").val().join("\r\n"))
	}else{
		$("[name='participantes']").val("")
	}
	if(application.sForm == "frHAN"){
		$("[name='equipoColaboraUniquePEQ']").val($("[name='equiposAnalisis']").val())
		$("[name='equipoColaboraNomPEQ']").val($("[name='equiposAnalisis'] option:selected").text())
	}
	
	$("[name='uniquePEQ']").val($("[name='peq']").val())
	$("[name='nomPEQ']").val($("[name='peq'] option:selected").text())		
		
	$("[name='unidAccion']").val(documento.sUnidAccion)
	if (documento.sUnidAccion == ""){
		$("[name='numeroAccion']").val("");
	}
}

function enlazarAccion(){
	/*if (documento.sUnidAccion != ""){
		$("#enlaceAccion").html("<a href='/"+application.sbdConexionDocumental+"/dnvwAccionesTPM/"+documento.sUnidAccion+"?Open' style='margin-right: 5px;' target='_blank'>Ver acción</a>")
		if (application.bEdicion) {
			$("#enlaceAccion").append("<a class='btn btn-danger btn-mini' href='javascript:void(0)' onclick='eliminarEnlaceAccion()'><i class='icon-trash icon-white'></i></a>")
		}
	}else{
		$("#enlaceAccion").empty();
	}*/
	if (documento.sUnidsAcciones){
		var arrUnids = documento.sUnidsAcciones.split(",");
		var arrRutas = documento.sBdAcciones.split(",");
		$("#enlaceAccion").html("")
		var url = "";
		for(var i in arrUnids){
			if (arrRutas[i] == "N") {
				url = "/"+application.sRutaBdConexion+"/xfAccion.xsp?documentId="+arrUnids[arrRutas.indexOf("N")]+"&action=readDocument";
			}else{
				url = "/"+application.sRutaBdConexionDoc+"/0/"+arrUnids[arrRutas.indexOf("A")];
			}
			$("#enlaceAccion").append("<div class='enlace_"+i+"' style='padding: 0 0 10px;'>");			
			$("#enlaceAccion .enlace_"+i).append("<a href='"+url+"' id='"+arrUnids[i]+"' style='margin-right: 5px;' target='_blank'>Ver acción</a>")
			if (application.bEdicion) {
				$("#enlaceAccion .enlace_"+i).append("<a class='btn btn-danger btn-mini' href='javascript:void(0)' onclick=eliminarEnlaceAccion('"+arrUnids[i]+"','"+i+"')><i class='icon-trash icon-white'></i></a>")
			}else{
				$("#enlaceAccion_"+i).append("</div>");
			}
		}	
	}else{
		$("#enlaceAccion").empty();
	}
}

function eliminarEnlaceAccion(unid, fila) {
	bConfirm("¿Confirma que desea eliminar el enlace de la acción?",function(response){
		if(response){
			var arrUnids = documento.sUnidsAcciones.split(",");
			var arrRutas = documento.sBdAcciones.split(",");
			var index = arrUnids.indexOf(unid);
			arrUnids.splice(index,1);
			arrRutas.splice(index,1);
			$(".enlace_"+fila).remove();
			if($("#enlaceAccion").html() == ""){
				$("[name='numeroAccion']").val("")
			}
			documento.sUnidsAcciones = arrUnids.join(",");
			documento.sBdAcciones = arrRutas.join(",");
			$("[name='unidsAcciones']").val(arrUnids);
			$("[name='rutasAcciones']").val(arrRutas);
		}
	});
}

function buscarAccion(){
	var num = $("[name='numeroAccion']").val();
	if (num == ""){
		bAlert("Debe ingresar el número de la acción")
		return false;
	}
	var url = application.sWebDbName + "agBuscarAccion?Open&num=" + num;
 	$.getJSON(url, function(data){
		if (data.msgError != ""){
			bAlert(data.msgError);
		}		
		var arrUnids = [];
		var arrRutas = [];
		var unids = data.unids;
		for(var i in unids){
			arrUnids.push(unids[i].unidAccion);
			arrRutas.push(unids[i].baseDatos);
		}
		$("[name='unidsAcciones']").val(arrUnids);
		$("[name='rutasAcciones']").val(arrRutas);
		documento.sUnidsAcciones = arrUnids.join(",");
		documento.sBdAcciones = arrRutas.join(",");
		enlazarAccion();
	})
	.error(function(){
		bAlert("No se procesaron los datos. por favor intente más tarde");
	})	
}

function buscarDocumentosAsociados(){
	if (!application.bNuevo){
		var tipo = $("[name='tipoDocumento']").val();
		var numConsecutivo = $("[name='consecutivoBusqueda']").val();
		if (tipo == ""){
			bAlert("Debe ingresar el tipo de documento");
			return false;		
		}
		
		if (numConsecutivo == "") {
			bAlert("Debe ingresar el consecutivo")
			return false;		
		}
		var url = application.sWebDbName + "agBuscarDocsAsociados?Open&tipoDocumento="+tipo+"&consecutivo="+numConsecutivo;
	 	$.getJSON(url, function(data){
			if (data.msgError != ""){
				bAlert(data.msgError);
			}else{
				var filas = $("#dDocumentosAsociados").find("table tbody tr");
				data.asociados[0].indice = indiceTabla("tblDocumentoAsociados").toString();
				if (filas.length > 0) {
					var con = parseInt(data.asociados[0].consecutivo, 10)+data.asociados[0].tipoDoc;
					var str = "";
					var flag = false;
					filas.each(function(){
						str = parseInt($(this).find("span.consecutivo").text(), 10)+$(this).find("[name='tipoDoc']").val(); 
						if ( str == con) {
							flag = true;
							return false;
						}					
					})
					if (!flag){
						$(filas[filas.length-1]).after(documento.templateTrDocumentosAsociados(data.asociados));
					}else{
						bAlert("El documento ya se encuentra asociado.")
					}		

				}else{				
					$("#dDocumentosAsociados").html(documento.templateTblDocumentosAsociados(data));				
				}
				
				var altura = $(document).height();
				$("html, body").animate({scrollTop:altura+"px"});
			}		
		})
		.error(function(){
			bAlert("No se procesaron los datos. por favor intente más tarde");
		})
	}else{
		bAlert("Debe guardar el documento, para poder asociar otros documentos.")
	}		
}

function eliminarDocumentoAsociado(obj){
	bConfirm("¿Confirma que desea borrar el enlace al documento asociado?",function(response){
		if(response){
			var table = $(obj).parents("table").first();
			var tr = $(obj).parents("tr").first();
			
			tr.remove();
			
			if ($(table).find("tbody tr").length == 0){
				$(table).parent().html("");				
			}	
			
		}
	});
}

function redimensionarModal(margen){
	if (!margen){
		margen = 0;
	}
	
	//parent.$('#ifModal').height(($("#general").height() + margen) +  "px")
	parent.$('#ifModal').height("500px")
}