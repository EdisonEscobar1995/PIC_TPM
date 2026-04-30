$(function(){
	cargarEstructura()
});

function cargarEstructura(accion, uniqueItem, flag){
	$("#vista").empty();
	var url = application.sWebDbName + "agCargarEstructura?Open&unique=" + application.sUnique + "&accion=" + (accion ? accion : "") + "&flag=" + (flag ? flag : "") + "&uniqueItem=" + (uniqueItem ? uniqueItem : "");
	$.get(url, function(data){
			$("#vista").html(data);
			$("#general").show();
			if ($("#dRespuesta").html() != ""){
				bAlert($("#dRespuesta").html());
				
			}
	}, "html")
	.error (function(){bAlert('No se procesaron los datos, por favor intente más tarde.')})
}

function agregar(codigo){
	if (codigo == "area" && $(".sede").length == 0){
		bAlert("Debe agregar sedes antes de agregar áreas")
		return false
	}
	if (codigo == "nivel" && $(".area").length == 0){
		bAlert("Debe agregar áreas antes de agregar niveles")
		return false
	}
	abrirModal(application.sWebDbName + "frItemEstructura?OpenForm&unique=" + application.sUnique + "&codigo=" + codigo, 440);
}

function subir(unique){
	bConfirm("Esta acción desplazará la entrada y todas sus dependencias. ¿Desea continuar?",function(response){
		if(response){
			cargarEstructura("SUB", unique);
		}
	});
}

function bajar(unique){
	bConfirm("Esta acción desplazará la entrada y todas sus dependencias. ¿Desea continuar?",function(response){
		if(response){
			cargarEstructura("BAJ", unique);
		}
	});
}

function etiquetarPEQ(unique, flag){
	cargarEstructura("PEQ", unique, flag);
}

function eliminar(unique){
	bConfirm("Esta acción eliminará la entrada y todas sus dependencias. ¿Desea continuar?",function(response){
		if(response){
			cargarEstructura("ELI", unique);
		}
	});
}