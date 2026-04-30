$(function(){
	$("[name='permiteAutoguardado']").on("change", function(){
		if ($(this).val() == "Si") {
			$(".tiempoAutoGuardado").css("display", "block");
		}else{
			$(".tiempoAutoGuardado").css("display", "none");
		}
	});
	
	$(".container").css("width","98%");
	$(".cabeza").css("width","99%");
	$(".cabeza .botones").css("right","40px");
	
	$("[name^='tipoCer']").parent("td").find(".select2-container").css("width", "180px");

	if(!application.bNuevo){
		$.each($(":input"), function(index, element){
			if(element.name.indexOf("tipoCer") != -1 && element.name.indexOf("%%Surrogate_") == -1 ){
				if(element.value == ""){
					$(element).val([]).trigger("change")
				}
			}
		})		
	}
	
	$("#general").show();
})

function guardar(){
	document.forms[0].submit();
}