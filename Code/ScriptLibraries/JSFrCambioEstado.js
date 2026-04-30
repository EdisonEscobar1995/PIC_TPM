$(function(){
	var boton;
	if(documento.sError == ""){
		boton= "<a id='btnEnviar' class='btn btn-mini' href='javascript:void(0)' onclick='guardarModal()'><i class='icon-arrow-right icon-white'></i> Enviar</a>";
		$("[name=estadoDestino]").on("change",function(){
			obtenerResponsable();
		})	
		if(parent.application.bEdicion){
			$("[name='autor']").val(parent.$("[name='autor']").val());
		}
		if(application.sForm == "frAdmonFlujo"){
			if($("[name='notificaciones'] option").length == 1 && $("[name='notificaciones'] option").first().html() == ""){
				$("[name='notificaciones']").val([]);
			}
			$("[name='notificaciones'], [name='acciones']").select2({placeholder: "Buscar"});
		}else{
			if (documento.sCampoResponsable != ""){
				$("[name=responsableDestino]").val($("[name='"+documento.sCampoResponsable+"']").val());
				$("#sResponsableDestino").html($("[name='"+documento.sCampoResponsable+"']").val());
			}
		}
		if (application.sForm == "frAdmonFlujo" || documento.sDirectorioResponsables == "names"){
			SelectFromAjaxField("[name='responsableDestino']", false, application.sWebDbName + 'agBuscarPersonas?Open');
		}else{
			var campoSel = "[name='responsableDestino']"; 
			if (documento.sDirectorioResponsables == "estadoGrupo") {
				campoSel = "[name='responsableDestinoGrupo']";
				$(campoSel).on("change", function(){
					var grupo = $(this).val();
					url = application.sWebDbName + "agObtenerResponsable?OpenAgent&unique=" + documento.sUniquePadre
												 + "&destino=" + $("[name=estadoDestino]").val()
												 + "&grupo=" + grupo
												 + "&edicion=" +parent.application.bEdicion;
					$.getJSON(url, function(data2){
						if (data2.msgError != ""){
							top.bAlert(data.msgError);
							documento.bValidarResponsable = true;
						}else{
							$("[name='responsableDestino']").val(data2.responsable);
						}
					})
				});
			}
			SelectFromAjaxField(campoSel,
								false,
								application.sWebDbName + 'agBuscarResponsables?Open&unique=' + $("[name=estadoDestino]").val(),
								"",
								"",
								"",
								0);
		}
		SelectFromAjaxField("[name='destinatarios']", true, application.sWebDbName + 'agBuscarPersonas?Open');
		$(".select2-results").css("max-height", "180px")

	}else{
		boton= "";
		$("#dCampos").hide();
		$("#dError").show();
	}

	adaptarModal("Cambio de estado", boton);
	$("#general").show();
})

function obtenerResponsable(modAsigRes){
	if ($("[name=estadoDestino]").val() == ""){
		$("#buscarResponsable").hide();
		$("[name=responsableDestino]").val("")
		documento.bValidarResponsable = true;
	}else{
		var url;
		if(application.sForm == "frAdmonFlujo"){
			url = application.sWebDbName + "agObtenerResponsable?OpenAgent&unique="+documento.sUniquePadre+"&flujo="+documento.sFlujo+"&origen="+documento.sEstadoOrigen+"&destino="+$("[name=estadoDestino]").val()+"&edicion="+parent.application.bEdicion;
		}else{
			url = application.sWebDbName + "agObtenerResponsable?OpenAgent&unique="+documento.sUniquePadre+"&destino="+$("[name=estadoDestino]").val()+"&edicion="+parent.application.bEdicion;
		}
		$("#dResponsableDestinoGrupo").hide();
		$("#dResponsableDes").show();
		$.getJSON(url, function(data){
			if (data.msgError != ""){
				top.bAlert(data.msgError);
				$("[name='estadoDestino']").val("");
				$("[name='responsableDestino']").val("");
				$("#dResponsable").show();
				documento.bValidarResponsable = true;
			}else{
				documento.sDirectorioResponsables = data.directorioResponsables
				var responsable = data.responsable
				if ((responsable == "" || data.aplicaSeleccion == "S") && data.posicion != "F"){
					documento.bValidarResponsable = true;
				}else{
					documento.bValidarResponsable = false;
				}
				if (responsable != "" || documento.bValidarResponsable){
					$("#dResponsable").show();
				}else{
					$("#dResponsable").hide();
				}
				
				$("[name='responsableDestino']").val(responsable);
				if (application.sForm == "frAdmonFlujo" || documento.sDirectorioResponsables == "names"){
					SelectFromAjaxField("[name='responsableDestino']", false, application.sWebDbName + 'agBuscarPersonas?Open');
					setResponsablePorGrupo();
				}else{
					setResponsablePorGrupo();
				}
				$(".select2-results").css("max-height", "180px")
				
				if($("[name=responsableDestino]").val()!= "" && data.resDefecto == "No"){
					$("#dResponsableDestino").hide();
					$("#sResponsableDestino").html(responsable);
				}else if($("[name=responsableDestino]").val()!= "" && data.resDefecto == "Si"){
					$("#dResponsableDestino").show();
					$("#sResponsableDestino").empty();
				}else{
					$("#dResponsableDestino").show();
					$("#sResponsableDestino").empty();
				}
				if(application.sForm == "frAdmonFlujo"){
					$("[name='notificaciones']").val(data.notificaciones)
					$("[name='acciones']").val(data.acciones)
					$("[name='notificaciones'], [name='acciones']").select2({placeholder: "Buscar"});
				}
			}
		})
		.error(function(){
			top.bAlert("No se procesaron los datos, por favor intente más tarde.")
		})	
	}
}

function setResponsablePorGrupo() {
	var campoSel = "";
	var isSetResponsible = false;
	if (documento.sDirectorioResponsables == "estadoGrupo") {
		isSetResponsible = true;
		$("#dResponsableDestinoGrupo").show();
		$("#dResponsableDes").hide();
		campoSel = "[name='responsableDestinoGrupo']";
		$(campoSel).on("change", function(){
			var grupo = $(this).val();
			url = application.sWebDbName + "agObtenerResponsable?OpenAgent&unique=" + documento.sUniquePadre
										 + "&destino=" + $("[name=estadoDestino]").val()
										 + "&grupo=" + grupo
										 + "&edicion=" +parent.application.bEdicion;
			$.getJSON(url, function(data2){
				if (data2.msgError != ""){
					top.bAlert(data.msgError);
					documento.bValidarResponsable = true;
				}else{
					$("[name='responsableDestino']").val(data2.responsable);
				}
			})
		});
	} else if (documento.sDirectorioResponsables != "names") {
		isSetResponsible = true;
		campoSel = "[name='responsableDestino']";
	}
	if (isSetResponsible) {
		SelectFromAjaxField(campoSel,
							false,
							application.sWebDbName + 'agBuscarResponsables?Open&unique=' + $("[name=estadoDestino]").val(),
							"",
							"",
							"",
							0);
	}
}

function guardar(){
	var aCampos = ["estadoDestino"];
	var aTipos = ["text"];
	if (documento.bValidarResponsable){
		aCampos.push("responsableDestino")
		aTipos.push("text");
	}
	if (camposNoValidos(aCampos, aTipos, true) > 0){
		top.bAlert("Por favor, diligencie correctamente los campos indicados", function(){
			if (application.oCampoFocus){
				$(application.oCampoFocus).focus()
			}
		});
		return false;
	}
	if (documento.sEstadoOrigen == $("[name='estadoDestino']").val()){
		top.bAlert("Debe elegir un estado diferente al estado actual", function(){
			if (application.oCampoFocus){
				$(application.oCampoFocus).focus()
			}
		});
		return false;
	}
	parent.$("#dModal .modal-footer").empty();
	$("#ajaxLoadingMessage").center();
	$("#ajaxLoadingMessage").show();

	if (parent.application.bEdicion){
		parent.$("[name=estadoDestino]").val($("[name=estadoDestino]").val()) 
		parent.$("[name=responsableDestino]").val($("[name=responsableDestino]").val());
		parent.$("[name=destinatarios]").val($("[name=destinatarios]").val());
		parent.$("[name=comentario]").val($("[name=comentario]").val());
		parent.$("[name=evento]").val("CE");
		if(application.sForm == "frAdmonFlujo"){
			parent.$("[name=admonFlujo]").val("S");
			var notificaciones = $("[name=notificaciones]").val();
			var acciones = $("[name=acciones]").val();
			parent.$("[name=notificaciones]").val(notificaciones ? notificaciones.join("\r\n") : "");
			parent.$("[name=acciones]").val(acciones ? acciones.join("\r\n") : "");
		}
		parent.document.forms[0].submit();
	}else{
		document.forms[0].submit();
	}
}
