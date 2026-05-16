$(function(){
	$('.wizard-steps li').click(function () { var step = $(this).data('step'); goToStep(step); });
	
	if (documento.sPrint == "Si"){
		var imp = "<a class='btn btn-mini' href='javascript:void(0)' onclick='fnImprimir(true)'><i class='icon-print icon-white'></i> Imprimir </a>"
		adaptarModal("Vista previa",imp);
		redimensionarModal(500);
		$("head").append("<style>table, .table td { border-color: #000 !important; }</style>");
	}
	self.setInterval("login()",1000 * 60 * 15);
	registerPartials(["hbTrCausaEfecto",
	                  "hbDivAnexo",
	                  "hbTrDocumentoAsociados",
	                  "hbDivEnlaceAnexo",
	                  "hbSelect",
	                  "hbArbol",
	                  "hbTdBotones",
	                  "hbTrPorQue",
	                  "hbTblPorQue",
	                  "hbTblAcciones",
	                  "hbTblAccionesCON",
	                  "hbTblActividades",
	                  "hbTrActividades",
	                  "hbTrAcciones"]);
	
	SelectFromAjaxField("[name='colaboradores']", true, application.sWebDbName + 'agBuscarIntegrante?Open&clave=A');
	SelectFromAjaxField("[name='nombreAccidentado']", false, application.sWebDbName + 'agBuscarPersonas?Open&dir=all&tag=Si');
	SelectFromAjaxField("[name='analisisValidadoPor']", false, application.sWebDbName + 'agBuscarPersonas?Open&dir=all&tag=Si');	
		
	$('#timepicker1').timepicker({
		icons:{
			up: 'icon-chevron-up',
			down: 'icon-chevron-down'
		}
	});
	
	$(".time").on("click", function(){
		$('#timepicker1').click();
	});
	
	if (application.bEdicion && $("[name='perteneceCicloMejora']").val() == "Si") {
		$(".rowCualCicloMejora").parent().show();
	} else {
		$(".rowCualCicloMejora").parent().hide();
	}
	
	$("[name='perteneceCicloMejora']").on("change", function(){
		/* $("#dCualCicloMejora table").show();
		$("#dCualCicloMejora table tr").show(); */
		if ($(this).val() == "Si"){
			$(".rowCualCicloMejora").parent().show();
		}else{
			$(".rowCualCicloMejora").parent().hide();
		}
	});
		
	$("[name='identificaNuevosRiesgos']").on("change", function(){
		// $("#dNuevosRiesgos table").show();
		// $("#dNuevosRiesgos table tr").show();
		if ($(this).val() == "Si"){
			$(".rowCualesRiesgos").parent().show();
		}else{
			$(".rowCualesRiesgos").parent().hide();
		}
	});
	
	$("[name='fieldReplicaInfoComple']").on("change", function(){
		if ($(this).val() == "Si"){
			// $("#dDondeReplicaInfoComple").show();
			$(".rowDondeReplica").parent().show();
		}else{
			// $("#dDondeReplicaInfoComple").hide();
			$(".rowDondeReplica").parent().hide();
		}
	});
	
	$("[name='tipo']").on("change", function(){
		var tipo = $(this).val();
		if ($(this).val() != "") {
			$(".camposTable table, .camposEncabezado table").hide();
			$(".camposTable tr, .camposEncabezado tr").hide();
			$("div[class^='seccion']").hide();
			$(".label-info").remove();
			documento.aParticipantes = $("[name='integrantes']").val();
			cargarDatos(function(){
				if ($("[name='tipo']").val() != "") {
					mostrarCampos(tipo);
				}else{
					$("#general").show();
				}
			}, tipo);
		}
	});
	
	if (documento.sUnidCostoBeneficio != ""){
		enlazarBeneficio(documento.sUnidCostoBeneficio,documento.sConsecutivoBen)
	}
	
	$(".camposTable table, .camposEncabezado table").hide();
	$(".camposTable tr, .camposEncabezado tr").hide();
	$("#dDondeReplicaInfoComple").hide();
	
	if (documento.sPrint == "Si") {
		cargarAnexos(function(){
			cargarDatos(function(){
				if ($("[name='tipo']").val() != "" && documento.sPrint != "Si") {
					mostrarCampos();
					$("#general").show();
				}else{
					fnImprimir();
					$("#general").show();
					setTimeout(function(){
						fnImprimir(true);
					},300);
				}
			});
		})
		
	}else {
		cargarAnexos(function(){
			cargarDatos(function(){
				if ($("[name='tipo']").val() != "") {
					mostrarCampos("", adaptarModalConexion);
					$("#general").show();
				}else{
					adaptarModalConexion();
					$("#general").show();
				}
			});
		})
	}
	
	if (documento.sPermiteAutoguardado == "Si" &&
		application.bEdicion &&
		parseInt(documento.sTiempoAutoguardado, 10) > 0 &&
		$("[name='sede']").val() != "") {
		var segundos = parseInt(documento.sTiempoAutoguardado, 10) * 60;
		var ms = segundos * 1000;
		setTimeout(function(){
			$("[name='fieldSig']").prop('disabled', false);
			guardarDatos(true);
		},ms);
	}
});

function goToStep(step) {

    step = parseInt(step, 10);

    // Steps
    $('.wizard-steps li').removeClass('active completed');

    $('.wizard-steps li').each(function () {
        var s = parseInt($(this).data('step'), 10);

        if (s < step) {
            // $(this).addClass('completed');
        } else if (s === step) {
            $(this).addClass('active');
        }
    });

    // Secciones
    $('.step-section').removeClass('active');
    $('.step-section[data-step="' + step + '"]').addClass('active');
}

function mostrarCampos(tipo, callback) {

    if (application.bEdicion) {
        tipo = (tipo ? tipo : $("[name='tipo']").val());
    } else {
        tipo = documento.sTipoHerramienta;
    }

    var url = application.sWebDbName +
        "agMostrarCamposAI?Open&edit=" + (application.bEdicion ? "1" : "0") +
        "&unique=" + application.sUnique +
        "&form=" + application.sForm +
        "&tipoHerramienta=" + tipo;
    
    // 🔹 Mapa de tablas
    var TABLE_MAP = {
        ordenInv: ".tableInv",
        ordenImpl: ".tableImp",
        ordenAna: ".tableAna",
        ordenInfCom: ".tableInfCom"
    };

    // 🔹 Mapa de secciones ANA
    var ANA_SECTIONS = {
        diagramacausaefecto: ".ddiagramacausaefecto",
        porque: ".dporque",
        capdo: ".dcapdo",
        actividades: ".dactividades",
        acciones: ".dacciones",
        "5w1h": ".d5w1h"
    };

    $.getJSON(url, function (data) {

        if (data.msgError != "") {
            location.href = application.sWebDbName + "frError?Open&msg=" + data.msgError;
            return;
        }

        documento.aCampos = [];
        documento.aTipos = [];
        documento.aCamposSeccionesRequeridas = [];
        documento.aTiposSeccionesRequeridas = [];

        if (!data.fields || data.fields.length === 0) {
            $(".camposTable table, .camposEncabezado table").hide();
            $(".camposTable tr, .camposEncabezado tr").hide();
            return;
        }

        // 🔹 Procesar campos
        $.each(data.fields, function (_, val) {

            var campoLower = val.campo.toLowerCase();
            
            if (campoLower == "beneficiotangiblereal" || campoLower == "beneficiointangiblereal") {
            	$(".seccionImpl").show();
            }
            
            if (campoLower == "contenidoinfocomple"){
				$(".contenidoInfoComple").show();
				$(".contenidoInfoComple table, .contenidoInfoComple table tr").show();
				if (val.requerido == "Si") {
					documento.aCampos.push("Body");
				}												
			}

            /* =====================================================
               🔹 SECCIONES ANA (NO TABLAS)
            ===================================================== */
            if (ANA_SECTIONS[campoLower]) {
            	// $(".seccionAna").show();
                var $section = $(ANA_SECTIONS[campoLower]);

                if ($section.length > 0) {

                    if (val.Show && val.Show[0] === "Si") {
                        $section.show();
                    } else {
                        $section.hide();
                    }

                    if (val.ordenAna && val.ordenAna !== "") {
                        $section.attr("data-order", parseInt(val.ordenAna, 10));
                    }
                }

                return; // ⛔ No seguir con lógica de tablas
            }

            /* =====================================================
               🔹 CAMPOS EN TABLAS
            ===================================================== */
            var $tr = $(":input").filter(function () {
                return this.name && this.name.toLowerCase() === campoLower;
            }).parents("tr");

            if ($tr.length === 0) return;

            var tableSelector = "";
            var orderValue = null;

            $.each(TABLE_MAP, function (ordenProp, selector) {
                if (val[ordenProp] && val[ordenProp] !== "") {
                    tableSelector = selector;
                    orderValue = parseInt(val[ordenProp], 10);
                    return false; // break
                }
            });

            if (!tableSelector) return;

            var $table = $(tableSelector).find("table");
            if ($table.length > 0) {
                $table.append($tr);
            }

            $tr.attr("data-order", orderValue || 9999);
            $tr.show();
            $table.show();

            if (val.requerido === "Si") {
                var name = $(":input", $tr).attr("name");
                if (name) {
                    documento.aCampos.push(name);
                    documento.aTipos.push($(":input", $tr).attr("multiple") ? "multi" : "text");
                }
            }
            
        });

        /* =====================================================
           🔹 ORDENAR TABLAS
        ===================================================== */
        $("tr:not([data-order])").attr("data-order", 9999);

        $.each(TABLE_MAP, function (_, selector) {

            var $table = $(selector).find("table");
            if ($table.length === 0) return;

            var rows = $table.find("tr[data-order]").get();

            rows.sort(function (a, b) {
                return (
                    parseInt($(a).attr("data-order"), 10) -
                    parseInt($(b).attr("data-order"), 10)
                );
            });

            $.each(rows, function (_, row) {
                $table.append(row);
            });
        });

        /* =====================================================
           🔹 ORDENAR SECCIONES ANA
        ===================================================== */
        $(".seccionAna > div:not([data-order])").attr("data-order", 9999);

        var anaSections = $(".seccionAna > div[data-order]").get();

        anaSections.sort(function (a, b) {
            return (
                parseInt($(a).attr("data-order"), 10) -
                parseInt($(b).attr("data-order"), 10)
            );
        });

        $.each(anaSections, function (_, section) {
            $(".seccionAna").append(section);
        });

        if (callback) callback();
        
        if ($("[name='perteneceCicloMejora']").val() == "Si") {
    		$(".rowCualCicloMejora").parent().show();
    	} else {
    		$(".rowCualCicloMejora").parent().hide();
    	}
        
        if ($("[name='identificaNuevosRiesgos']").val() == "Si") {
    		$(".rowCualesRiesgos").parent().show();
    	} else {
    		$(".rowCualesRiesgos").parent().hide();
    	}
        
        if (documento.sFieldReplicaInfoComple == "Si") {
    		$(".rowDondeReplica").parent().show();
    	} else {
    		$(".rowDondeReplica").parent().hide();
    	}

        $("#general").show();

    }).error(function () {
        location.href = application.sWebDbName + "frError?Open&msg=3";
    });
}

function mostrarCamposOld(tipo, callback) {
	if(application.bEdicion){
		tipo = (tipo ? tipo : $("[name='tipo']").val());		
	}else{
		tipo = documento.sTipoHerramienta;
	}
	
	var url = application.sWebDbName + "agMostrarCamposAI?Open&edit=" + (application.bEdicion ? "1" : "0") + "&unique=" + application.sUnique + "&form=" + application.sForm + "&tipoHerramienta=" + tipo;
	$.getJSON(url, function(data){
		if (data.msgError == ""){
			var tr = "";
			var table = "";
			var name = "";
			documento.aCampos = [];
			documento.aTipos = [];
			if (data.fields.length > 0) {
				$.each(data.fields, function (i, val){
					tr = $(":input").filter(function(){
						if (this.name.toLowerCase() == val.campo){
							name = this.name;
							if (val.requerido == "Si") {
								documento.aCampos.push(name);
								var sTipo = "text";
								if ($(this).attr("multiple")){
									sTipo = "multi";
								}
								documento.aTipos.push(sTipo);
							}							
							return this.name.toLowerCase() == val.campo
						}else{
							return this.name.toLowerCase() == val.campo
						}						
					}).parents("tr");
					
					if ($(tr).length > 0) {
						table = $(tr).parents("table");
						$(tr).attr("class", $("[name='tipo']").val())
						
						table.show();
						tr.show();
					}
					
					if(val.campo.toLowerCase() == "cronograma"){
						if (val.requerido == "Si") {
							$(".seccionCronograma :input").each(function(){
								documento.aCamposSeccionesRequeridas.push(this.name);
								documento.aTiposSeccionesRequeridas.push("text");
							})	
						}											
						$(".seccionCronograma").show();
					}
					
					if(val.campo.toLowerCase() == "diagramapareto"){
						$(".seccionDiagramaPareto").show();
					}
					
					if (val.campo.toLowerCase() == "diagramacausaefecto"){
						$(".seccionCausaEfecto").show();
					}
					
					if (val.campo.toLowerCase() == "porque"){
						$(".seccionPorQue").show();
					}
					
					if (val.campo.toLowerCase().indexOf("5w1h") > -1){
						$("[name='5w1h']").parents("tr").show();
						$("[name='5w1h']").parents("tr").parents("table").show();
					}
					
					if (val.campo.toLowerCase().indexOf("infocomple") > -1 || val.campo.toLowerCase() == "beneficiotangible" || val.campo.toLowerCase() == "beneficiointangible"){
						$("[name='infoComplementaria']").parents("tr").show();
						$("[name='infoComplementaria']").parents("tr").parents("table").show();
						$("[name='infoComplementaria']").parents("tr").parents("table").css("margin","0");
						$("#dDondeReplicaInfoComple table, #dDondeReplicaInfoComple table tr").show();
					}
					
					if (val.campo.toLowerCase() == "contenidoinfocomple"){
						$(".contenidoInfoComple").show();
						$(".contenidoInfoComple table, .contenidoInfoComple table tr").show();
						if (val.requerido == "Si") {
							documento.aCampos.push("Body");
						}												
					}
					
				})
			}else{
				$(".camposTable table, .camposEncabezado table").hide();
				$(".camposTable tr, .camposEncabezado tr").hide();
			}				
			
			if ($(".idAccion").length > 0) {
				$("[name='fieldSig']").prop('disabled', true);
			}else{
				$("[name='fieldSig']").prop('disabled', false);
			}
			
			$("[name='fieldSig']").on("change", function(){
				if(this.value == "Si"){
					$("#dAcciones").html(documento.templateTblAccionesCON({}));
				}else{
					$("#dAcciones").html(documento.templateTblAcciones({acciones:[]}));
				}
				
				if(documento.ayudas){
					setAyudaBotones(documento.ayudas);
				}
			})
			
			if (documento.sPermitirDocumentosAsociados == "Si"){
				$(".seccionDocsAsociados").show();
			}
			if(callback){
				callback();
			}
			$("#general").show();
			
		}else{
			location.href = application.sWebDbName + "frError?Open&msg=" + data.msgError
		}
	})
	.error(function(){
		location.href = application.sWebDbName + "frError?Open&msg=3"
	})	
}

function cargarDatos(callback, tipo){
	var url = application.sWebDbName + "agCargarFormHANAI?Open"
									 + "&edit=" + (application.bEdicion ? "1" : "0") 
									 + "&unique=" + application.sUnique 
									 + "&form=" + application.sForm 
									 + "&sede=" + urlencode(documento.sSede) 
									 + "&area=" + urlencode(documento.sArea) 
									 + "&uniquePEQ=" + documento.sUniquePEQ 
									 + "&peq=" + urlencode(documento.sPEQ) 
									 + "&nuevo=" + (application.bNuevo ? "1" : "0") 
									 + "&tipo=" + (tipo ? tipo : "")
									 + "&aplicaSIG=" + urlencode(documento.sAplicaSIG)
									 
	$.getJSON(url, function(data){
		if (data.msgError == ""){
			$("[name='sede']").on("change", function(){
				changeSede(this);
			})
			
			documento.aIntegrantes = data.integrantes;
			agregarExIntegrantes(documento.aParticipantes);
			
			documento.opcionesCausasEfectoMs = data.opcionesCausasEfectoMs;
			
			if(data.causaEfectoMS.length == 0){
				$("#dCausaEfecto").html("");
				data.causaEfectoMS = filaVacia("C");
			}
			
			if(data.porQue.length == 0){
				$("#dPorQue").html("");
				data.porQue = filaVacia("P");
			}		
			
			if(documento.sPrint != "Si"){
				if (data.asociados.length > 0) {
					$("#dDocumentosAsociados").html(documento.templateTblDocumentosAsociados(data));
				}
			}
			
			
			cargarDatosSede(data);
			
			if(documento.sPrint == "Si"){
				if($("#dPEQ select[name=peq]").length > 0){
					$("#dPEQ").html($("#dPEQ select[name=peq] option:selected").text())
				}
				
				if($("#dArea select[name=areaPEQ]").length > 0){
					$("#dArea").html($("#dArea select[name=areaPEQ] option:selected").text())
				}	
			}
			
			$("#dCausaEfecto").html(documento.templateTblCausaEfecto(data));
			$("#dPorQue").html(documento.templateTblPorQue(data));			
								
			$("select").select2({
				placeholder: "Buscar", 
				allowClear: true
			});
			
			$("select").on("change", function(){
				$(this).parents("td").find(".aviso").remove();
			})
			
			$("[name*=respuesta]").css("max-width", "160px");
			
			if (application.bEdicion){
				$('.datepicker').datepicker({
					autoclose:true,
					language:'es'
				});
				
				$("[name='numeroAccion']").on("keypress", function(event){
					validarEnter(event, '.btn-buscarAccion')
				}).on("blur", function(event){
					buscarAccion();
				})
			
				if (application.sForm == "frHAN"){
					$("#dEstructura [type='radio']").each(function(){
						if(this.value == documento.sMaquina){
							$(this).attr("checked", true)
							return false;
						}
					})
				}
				
				if (documento.sPrint == "Si") {
					setAyudas(data, true);
				} else {
					setAyudas(data);
				}
			}		
			
			setLabels(data);
			
			if (documento.sPrint != "Si"){
				$("div[class^='seccion']").hide();
			}else{
				$(".center").css("text-align", "center");
			}
			
			if (documento.sUnidAccion != ""){
				enlazarAccion()
			}
			
			cargarAcciones(callback, data);
		}else{
			location.href = application.sWebDbName + "frError?Open&msg=" + data.msgError
		}
	})
	.error(function(){
		location.href = application.sWebDbName + "frError?Open&msg=3"
	})	
}

function fnImprimir(imp) {
	if (imp) {
		var target = parent.top.document.getElementById('ifModal');			
		try{
			target.contentWindow.document.execCommand('print', false, null);
		}catch(e){
			// target.contentWindow.print();
		}
	}else{
		$("#tblCausaEfecto select, #tblPorQue select").each(function(){					
			$(this).parent().append("<span>"+$(this).val()+"</span>");
			$(this).prev().hide();
			$(this).hide();
		})
		
		$("#tblCausaEfecto textarea, #tblPorQue textarea").each(function(){
			$(this).parent().append("<span>"+$(this).val()+"</span>");
			$(this).hide();
		})
		
		$(".btn").remove();
		$(".contenedorCabezote").remove();
		$(".icon-remove").remove();
		
		$(".cabeza").css({"position": "absolute", "top": "0"});
		$(".container").css("margin-top","6.5%");		
		$("input[type=radio]").prop("disabled",true);
		
		if ($("#tblCausaEfecto .idAccion").length > 0) {
			removeTd("tblCausaEfecto", true);
		}else{
			removeTd("tblCausaEfecto");
		}
		
		/* if ($("#tblPorQue .idAccion").length > 0) {
			removeTd("tblPorQue", true);
		}else{
			removeTd("tblPorQue");
		} */
		$("#tblPorQue td").css("min-width", "50px");
				
	}	
	
}

function removeTd(table, tbody) {
	if (tbody) {
		$("#"+table+" tbody td").each(function(){
			if($(this).html() == ""){		
				$(this).remove();
			}
		})
	}else{
		$("#"+table+" td").each(function(){
			if($(this).html() == ""){		
				$(this).remove();
			}
		})
	}
}

function camposValidos(){
	var contador = 0;
	
	var aCampos = [];
	var aTipos = [];
	
	if ($("[name='sede']").length > 0){
		aCampos.push("sede", "areaPEQ", "tipo");
		aTipos.push("text", "text", "text");
	}
	
	aCampos = aCampos.concat(documento.aCampos);
	aTipos = aTipos.concat(documento.aTipos);
	
	$.each(documento.aCamposSeccionesRequeridas, function (i, val){
		if (val != "" && val.substring(0,2) != "%%") {
			aCampos.push(val);
		}		
		aTipos.push("text");
	})
	
	aCampos = cleanArray(aCampos);
	
	var i = aCampos.indexOf("Body");
	
	if (i != -1) {
		aCampos.splice(i, 1);
		var nombreCampo = $(".ckeditor-field").attr("name");
		var cadena = $('#cke_'+nombreCampo+' iframe').contents().find('body').html();
		cadena = cadena.replace(/<[^>]+>/g,'');
		if (cadena == "") {
			aCampos.push("dVacio");
			aTipos.push("div");
		}
	}	
	
	var pos = aCampos.indexOf("anexosSegInfoComple");
	if(pos != -1) {
		if($("#dSeguimientoInfoComple").find(".enlaceAnexo").length > 0){
			var aCamposAux = [];
			var aTiposAux = [];
			for(var i in aCampos){
				if(aCampos[i] != "anexosSegInfoComple"){
					aCamposAux.push(aCampos[i]);
					aTiposAux.push(aTipos[i]);
				}
			}
			
			aCampos = aCamposAux;
			aTipos = aTiposAux;
			
		}
	}
	
	contador += camposNoValidos(aCampos, aTipos, true);
	
	aCampos = ["numero"]; 
	aTipos = ["text"];
		       	
   	$(".filaActividad").each(function(){
   		contador += camposNoValidos(aCampos, aTipos, false, this);
   	});
		
	if (contador > 0){
		bAlert("Por favor, diligencie correctamente los campos indicados");
		return false;
	}
	
	$("[name='fieldSig']").prop('disabled', false);
	
	return true;
}

function cleanArray(actual) {
  var newArray = new Array();
  for (var i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;
}

function guardarDatos(submit, callback){
	
	if (application.bEdicion){
		
		$("[name='horaProblema']").val()
	}
	
	var causaEfecto, porQue, accion, orden;
	
	cadena = "";
	separador = "";
	orden = "";
	
	var tipoHerramienta = $("[name='tipo']").val();
	
	$("#tblCausaEfecto tbody tr").each(function (index){
		causaEfecto = $(this);
		
		id = causaEfecto.find("[name='id']").val();
		clave = causaEfecto.find("[name='causaEfectoMS']").val();
		orden = causaEfecto.attr("class");		
		
		if (clave != ""){
			cadena += formatoValor(separador, id),			
			cadena += formatoValor("&", tipoHerramienta)
			cadena += formatoValor("&", causaEfecto.find("[name='causaEfectoMS']").val())
			cadena += formatoValor("&", causaEfecto.find("[name='respuesta1']").val())
			cadena += formatoValor("&", causaEfecto.find("[name='respuesta2']").val())
			cadena += formatoValor("&", causaEfecto.find("[name='respuesta3']").val())			
			cadena += formatoValor("&", causaEfecto.find("[name='respuesta4']").val())
			cadena += formatoValor("&", causaEfecto.find("[name='respuesta5']").val())
			cadena += formatoValor("&", orden)
			if (id == ""){
				cadena += formatoValor("&", "tblCausaEfecto" + causaEfecto.attr("class"))
			}else{
				cadena += formatoValor("&", "")
			}
			separador = "@"	
		}
	})
	document.forms[0].listaCausasEfecto.value = cadena;
	
	cadena = "";
	separador = "";
	orden = "";
	
	$("#tblPorQue tbody tr").each(function (index){
		porQue = $(this);
		var selectPorque = porQue.find("[name='porQueTbl']").val();
		id = porQue.find("[name='id']").val();
		clave = porQue.find("[name='porQueTbl']").val();
		orden = porQue.attr("class");
		
		cadena += formatoValor(separador, id),
		cadena += formatoValor("&", tipoHerramienta)
		cadena += formatoValor("&", selectPorque ? selectPorque.join("##enter##"): "");
		cadena += formatoValor("&", porQue.find("[name='respuesta1']").val())
		cadena += formatoValor("&", porQue.find("[name='respuesta2']").val())
		cadena += formatoValor("&", porQue.find("[name='respuesta3']").val())			
		cadena += formatoValor("&", porQue.find("[name='respuesta4']").val())
		cadena += formatoValor("&", porQue.find("[name='respuesta5']").val())
		cadena += formatoValor("&", orden)
		if (id == ""){
			cadena += formatoValor("&", "tblPorQue" + porQue.attr("class"));
		}else{
			cadena += formatoValor("&", "");
		}
		separador = "@";	
	})
	document.forms[0].listaPorQue.value = cadena;
	
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
	
	var obj = {
			submit: submit,
			callback: guardarDatosPEQ,
			callback1: callback,
			direccion: (callback ? arguments[2]: "") 
	}
	
	guardarActividades(obj);
}

function filaVacia(cod, pilar){
	switch (cod){	
	case "C":		
		return [{indice:(indiceTabla("tblCausaEfecto") == 0 ? 1 : indiceTabla("tblCausaEfecto")), 
				 unique:"", 
				 maestroCausasEfectoMs:{nombre:"causaEfectoMS", valores:[], opciones:documento.opcionesCausasEfectoMs}, 
				 respuesta1:"", 
				 respuesta2:"", 
				 respuesta3:"", 
				 respuesta4:"", 
				 respuesta5:"" }]
		break;
	case "P":
		return [{indice:(indiceTabla("tblPorQue") == 0 ? 1 : indiceTabla("tblPorQue")), 
				  unique:"", 
				  maestroPorQue:{nombre:"porQueTbl", valores:[], opciones:documento.opcionesCausasEfectoMs, isMultiple: true}, 
				  respuesta1:"", 
				  respuesta2:"", 
				  respuesta3:"", 
				  respuesta4:"", 
				  respuesta5:"" }]
		break;
	}
}

function adicionarFila(obj, data , idTabla){
	var tr = $(obj).parents("tr").first();
	var tabla = idTabla? idTabla : tr.parents("table").first().attr("id");
	switch (tabla){
	case "tblCausaEfecto":
		tr.after(documento.templatehbTrCausaEfecto(filaVacia("C")));
		tr = tr.next("tr");		
		break;
	case "tblPorQue":
		tr.after(documento.templatehbTrPorQue(filaVacia("P")));
		tr = tr.next("tr");
		break;
	case "tblAcciones":
		var fila = [{
			indice:data.indice,
			descAccion:data.accion,
			unidAccion:data.unidAccion,
			accion:data.accion,
			esTableAccion:data.esTableAccion,
			tipoAccion:data.tipoAccion,
			responsable:data.responsable,
			responsableAccion: data.responsableAccion,
			fechaImplementacion:data.fechaImplementacion,
			estado:data.estado }]
		if(tr.length){
			tr.after(documento.templatehbTrAcciones(fila));
		}else{
			$("#dAcciones").html(documento.templateTblAcciones({acciones:fila}));
			tr = $("#tblAcciones tbody tr").first();
		}
		tr = tr.next("tr");
		break;	
	}
	
	ordenarIndice(tabla);
	
	addOnChange(tr.find(":input"));
	tr.find('.datepicker').datepicker({
		autoclose:true,
		language:'es'
	});
	tr.find("select").select2({placeholder: "Buscar", allowClear: true});
	$("[name*=respuesta]").css("max-width", "160px");
}

function eliminarFila(obj){
	bConfirm("Â¿Confirma que desea eliminar la fila seleccionada?",function(response){
		if(response){
			var table = $(obj).parents("table").first();
			var tr = $(obj).parents("tr").first();
			if (tr.siblings().length == 0){
				tr.find("input, select, textarea").each(function (){
					$(this).val("");
				})
				tr.find("select[multiple]").each(function (){
					$(this).val([]);
				})
				
				tr.find(".aviso").remove();
				tr.find(".idAccion").remove();
				tr.find("select").select2({placeholder: "Buscar", allowClear: true});				
			}else{
				tr.remove()
			}
			
			if ($(".idAccion").length > 0) {
				$("[name='fieldSig']").prop('disabled', true);
			}else{
				$("[name='fieldSig']").prop('disabled', false);
			}
			
			var tabla = $(table).attr("id");			
			ordenarIndice(tabla);
			
		}
	});
}

function crearAccion() {
	var parametros;
	var aplicaSIG = $("[name='fieldSig']").val();	
	if(!aplicaSIG){
		var label = $("[name='fieldSig']").parents("tr").find("td").first().text()
		bAlert("Debe seleccionar una opciÃ³n en el campo: " + label );
		return;
	}
	
	if (!application.bNuevo){
			bConfirm("Â¿Confirma que desea crear una acciÃ³n?",function(response){			
				if(response){
					var url;
					var unique =  application.sUnique;
					if (aplicaSIG && aplicaSIG == "Si"){					
						if($("#dAcciones").html() == ""){
							$("#dAcciones").html(documento.templateTblAccionesCON({}));						
						}
						
						var titulo = urlencode($("[name='titulo']").val());
						var sede = urlencode($("[name='sede']").val());
						var fenomeno = urlencode($("[name='fenomeno5w1h']").val());					
						
						
						parametros = "&unique=" + unique
									+ "&titulo=" + titulo
									+ "&sede=" + sede
									+ "&fenomeno=" + fenomeno;
						
						url = "/"+application.sRutaBdConexion+"/xfAccion.xsp?Open"+parametros+"&modalTPM=true";						
					}else{
						obj = $("#tblAcciones tr").last().find("a.btn");
						esTableAccion = "Si";
						
						if($("#dAcciones").html() == ""){
							$("#dAcciones").html(documento.templateTblAcciones({acciones:[]}));
						}
						
						var tr = "";
						var tabla = "";
						var id = "";
						var indice = 0;
						
						if($(obj).parents("tr").length){
							tr = $(obj).parents("tr");
							tabla = tr ? $(tr).parents("table").attr("id"): $("#tblAcciones").attr("id");
							id = tr.find("[name='id']").val() ? tr.find("[name='id']").val() : "";
							indice = parseInt(tr.attr("class"), 10);
						}else{
							tabla = $("#tblAcciones").attr("id");
							tr = $(obj).parents("tr");
						}
						
						parametros = "&rutaDocumental=" + application.sRutaBdConexion 
						 + "&unique=" + (id ? id : unique)
						 + "&usuario=" + application.sUsuarioAbbreviate
						 + "&indice=" + indice
						 + "&tabla=" + tabla
						 + "&aplicaSIG=" + aplicaSIG
						 + "&esTableAccion=Si"
						 + "&tpm=Si";
						
						url = application.sWebDbName+"/frAccion?Open"+parametros+"&modal=true&id=" + Math.random();
						
					}
					
					abrirModalLarge(url,"modalLarge", showLoading);
				}
			});
	}else{
		bAlert("Debe guardar el documento para poder crear acciones.");
	}
		
}

function adicionarFilaAccion(datosAccion){
	var obj = $("#tblAcciones tr").last().find("a.btn");
	var idTabla = "";
	if(!obj.length){
		idTabla = "tblAcciones";
	}
		
	adicionarFila(obj, datosAccion, idTabla);
}

function adicionarAccionCON(datosAccion){
	$("#dAcciones").html(documento.templateTblAccionesCON(datosAccion));
}

function enlazarBeneficio(unid,consecutivo){
	if (unid != ""){
		var url = "/"+application.sRutaCostoBen+"/0/"+unid+"?Open&tipo=TP&modal=true&accion=modal&id="+Math.random();
		$("#enlaceBeneficio").html("<a href='javascript:void(0)' onclick='abrirModalLarge(\""+url+"\",\"modalLarge\")' >ver costo beneficio ("+consecutivo+")</a>")
	}else{
		$("#enlaceBeneficio").empty();
	}
}

function ordenarIndice(tabla) {
	var span;
	var fila;
	$("#"+tabla+" tbody tr").each(function(i, val){	
		fila = $(this).attr("class");
		if (fila){			
			span = $(this).find(".indice_"+(fila));			
			$(this).removeAttr("class");
			$(this).attr("class", (i+1));
			$(span).removeAttr("class");
			$(span).attr("class", "indice_"+(i+1));
			$(span).text((i+1));		
		}
		
	})
}

function guardarModalAccion(sClass){
	$(window.frames["ifModal"].document).find("[data-name='idHATPM']").val(parent.$("[name='unique']").val());
	$(window.frames["ifModal"].document).find("[data-name='rutaHATPM']").val(application.sWebDbNameTPM);
	$(window.frames["ifModal"].document).find("[data-name='modalTPM']").val("true");
	if(sClass == "btnGuardar"){
		ocultarElementosModal();
	}
	$(window.frames["ifModal"].document.getElementsByClassName(sClass)).click();
}

function eliminarAccion(idAccion, dbOrigen){
	bConfirm("Â¿Confirma que desea eliminar la acciÃ³n?",function(response){
		if(response){
			var url = application.sWebDbName + "agDesenlazarAccion?Open&idAccion=" + idAccion + "&dbOrigen=" + dbOrigen; 
			$.getJSON(url, function(data){
				if (data.msgError == ""){
					$("#dAcciones").html(documento.templateTblAccionesCON({datosAcciones: []}));
					$("[name='unidAccionConexion']").val("");
					if(documento.ayudas){
						setAyudaBotones(documento.ayudas);
					}
				}else{
					bAlert(data.msgError);
				}
			})
		}
	});
}

Handlebars.registerHelper('existeAccion', function(context, options) {
	if (this.unidAccion) {
		return options.fn ( this );
	} else {
		return options.inverse ( this );
	}
});

Handlebars.registerHelper('items', function(items, options) {
	if (items.length > 0) {
		return options.fn ( this );
	} else {
		return options.inverse ( this );
	}
});

function redimensionarModalConexion(height){
	parent.$('#ifModal').height((height) +  "px");
}

function asociarAccion(){
	if (!application.bNuevo){
		var url = "/"+application.sRutaBdConexion+"/xfAsociacion.xsp?modalTPM=true";
		abrirModalLarge(url,"modalLarge", showLoading);		
	}else{
		bAlert("Debe guardar el documento para poder asociar la acciÃ³n.");
	}
}

function guardarModalAsociacion(ruta){
	var objAccion = null;
	var acciones = $(window.frames["ifModal"].document.getElementsByClassName("radioAsociacion"));
	$.each(acciones, function(index, element){
		if($(element).prop("checked")){
			objAccion = $(element); 
		}
	});
	
	if(objAccion){
		var url = application.sWebDbName + "xaServicios.xsp?Open"
		+ "&accion=asociarAccion"
		+ "&unique=" + application.sUnique
		+ "&idAccion=" + objAccion.val()
		+ "&negocio=" + objAccion.attr("data-negocio")
		+ "&ruta=" + ruta;
		
		$.getJSON(url, function(data){
			if (data.error == ""){
				$("[name='fieldSig']").prop('disabled', true);
				$("[name='unidAccionConexion']").val(objAccion.val());
				$("[name='consecutivoAccionCone']").val(objAccion.attr("data-consecutivo"));
				$("#dAcciones").html(documento.templateTblAccionesCON(data.datosAccion));
				parent.cerrarModal();
			}else{
				bAlert(data.error);
			}
		})
	}else{
		bAlert("Debe seleccionar la acciÃ³n que desea asociar");
		return false;
	}
}

function cargarAcciones(callback, loadData){
	var url = application.sWebDbName + "xaServicios.xsp?Open"
	 + "&accion=cargarAcciones" 
	 + "&unique=" + application.sUnique
	 + "&aplicaSIG=" + urlencode(documento.sAplicaSIG)
	 
	 $.getJSON(url, function(data){
		 if (data.error == ""){
			 if(documento.sAplicaSIG == "Si"){
				 var objAccion = {};
				 if(data.acciones.length > 0){
					 objAccion = data.acciones[0]; 
				 }
				 $("#dAcciones").html(documento.templateTblAccionesCON(objAccion));
			 }else{
				 $("#dAcciones").html(documento.templateTblAcciones(data));
			 }
			 
			 setAyudaBotones(loadData);
			 
			 if(documento.modalConexion){
				 $("#tblAcciones").hide();
				 $(".btnAccion, .btnAsociarAccion").remove();
				 
				 if($(".filaActividad").find("a").length > 0){
					 $(".filaActividad").find("a").removeAttr("onclick");
					 $(".filaActividad").find("a").css({
						"text-decoration": "none",
						"color": "inherit",
						"cursor": "auto"
					 });
				 }
			 }
			 
			 if(callback){
				 callback();
			 }else{
				 $("#general").show();
			 }
		 }else{
			 location.href = application.sWebDbName + "frError?Open&msg=" + data.error
		 }
	 })
	 .error(function(){
		 location.href = application.sWebDbName + "frError?Open&msg=3"
	 })
}

function abrirActividad(unid){
	var url = "/"+application.sRutaBdConexion+"/xfActividad.xsp?documentId="+unid+"&action=editDocument&modalTPM=true";
	abrirModalLarge(url,"modalLarge", showLoading);
}

function guardarActividades(obj){
	
	var ejecutarFunciones = function(obj){
		if(obj.callback){
			obj.callback();
		}
		
		if(obj.callback1){
			obj.callback1(obj.direccion);
		}
		
		if(obj.submit){
			document.forms[0].submit();			
		}
	}
	
	if($(".filaActividad").length > 0){
		$.post(application.sWebDbName + "xaServicios.xsp?Open&accion=guardarActividades&id=" + Math.random(),{
			data: JSON.stringify(getDatosActividades())
		},function(data) {
			if(data.error == ""){
				ejecutarFunciones(obj);
			}else{
				bAlert(data.error);
			}
		}).fail(function(jqXHR) {
			var data = errorRequest(jqXHR)
			if (data.error){
				bAlert(data.Error)
			}
		});		
	}else{
		ejecutarFunciones(obj);
	}
}

function getDatosActividades(){
	var actividades = [];
	
	$.each($(".filaActividad"), function(index, element){
		actividades.push({
			unique: $(element).attr("data-unique"),
			idConexion: $(element).attr("data-idConexion"),
			posicion: $(element).attr("data-posicion"),
			numero: $(element).find("[name='numero']").val()
		})
	});
	
	return {actividades: actividades, uniquePadre: application.sUnique};
}

function agregarTexto(name){
	var texto, fenomeno;
	if(name){
		fenomeno = $("[name='fenomeno5w1h']").val();
		texto = $("[name="+name+"]").val();
		if(texto){
			if(fenomeno){
				fenomeno += " " + texto;
			}else{
				fenomeno = texto;
			}
			$("[name='fenomeno5w1h']").val(fenomeno);
		}
	}
}

function setAyudaBotones(data){
	documento.ayudas = {ayudas: data.ayudas};
	var setPopover = function(data, sClass){
		var ayuda;
		var pos = data.ayudas.map(function(element){
	        return element["campo"];
	    }).indexOf(sClass);
		 
		 if(pos != -1){
			ayuda = data.ayudas[pos].ayuda;
			$("."+sClass).attr({
				"rel":'popover',
				"data-html": true,
				"data-content": ayuda.join("<br>")
			})
			$("."+sClass).popover({trigger:"hover"});
		 }
	}
	
	setPopover(data, "btnAccion");
	setPopover(data, "btnAsociarAccion");
	setPopover(data, "btnAgregarTexto");
}

function adaptarModalConexion(){
	if(documento.modalConexion){
		var botones = "";
		var sede = "";
		if(application.bEdicion){
			botones = "<a class='btn btn-primary' href='javascript:void(0)' onclick='guardarModalHA(\"btnGuardar\")'>Guardar </a>";
			if($(".btnAvanzar").length > 0 && documento.sPosEstado == "I"){
				botones += "<a class='btn btn-success' href='javascript:void(0)' onclick='guardarModalHA(\"btnAvanzar\")'>" + $(".btnAvanzar").text() + " </a>";						
			}
		
			if(documento.sPosEstado != "I"){
				botones += "<a class='btn btn-info' href='"+application.sWebDbName+"0/"+application.sUnid+"' target='_blank'>Abrir herramienta de anÃ¡lisis</a>"	
			}
			
			if(application.bNuevo){
				$("[name='autor']").val(parent.$("[data-name='responsableAccion']").val());
				$("[name='titulo']").val(parent.$("[data-name='titulo']").val());
				$("[name='fieldSig']").val("Si").trigger("change");
				
				sede = parent.$("[data-name='sedes']").length > 0 ? parent.$("[data-name='sedes'] option:selected").text() : parent.viewScope.nombreSedesAccion[parent.viewScope.posSedeSeleccionada];
				$("[name='sede']").select2("val",sede).trigger("change");
				setTimeout(function(){	
					$('#cke_1_contents iframe').contents().find("body").html(parent.$("[data-name='descripcion']").val().split("\n").join("<br>"));
				},1000)
				
			}
			
			$(".btnAccion, .btnAsociarAccion").remove();
		}
		parent.$("body").addClass("modal-open");
		parent.adaptarModal("Herramienta de anÃ¡lisis",botones);
	}
}

function recargarModal(){
	var iframe = document.getElementById("ifModal");
	iframe.src = iframe.src;
}

function ocultarElementosModal(){
	top.showLoading();
	parent.$(".modal-header .btn").hide();
	parent.$(".modal-footer .btn").hide();
}