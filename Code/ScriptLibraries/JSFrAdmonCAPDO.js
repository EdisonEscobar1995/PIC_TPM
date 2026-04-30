$(function(){
	
	$("[name='permiteAutoguardado']").on("change", function(){
		if ($(this).val() == "Si") {
			$(".tiempoAutoGuardado").css("display", "block");
		}else{
			$(".tiempoAutoGuardado").css("display", "none");
		}
	});
	
	$("#general").show();
})

function guardar(){
	document.forms[0].submit();
}