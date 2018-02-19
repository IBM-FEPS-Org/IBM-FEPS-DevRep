fepsApp.controller('advisoryBoardDetailsController', function ($scope, $translate, $uibModalInstance)
{
	
	
	$(document).ready(function()
	{
		$scope.member = $uibModalInstance.member;
		if($scope.member == 1)
		{
			$("#memberPhoto").attr("src","../../../img/AdvisoryBoard/Dr.%20Mahmoud%20El%20Said.jpg");
			document.getElementById("memberName").innerHTML = $translate.instant('advisoryBoardMember1');
			document.getElementById("memberBio").innerHTML = $translate.instant('advisoryBoardMember1Bio');
		}
		else if($scope.member == 2)
		{
			$("#memberPhoto").attr("src","../../../img/AdvisoryBoard/Dr.%20Samiha%20Fawzy.jpg");
			document.getElementById("memberName").innerHTML = $translate.instant('advisoryBoardMember2');
			document.getElementById("memberBio").innerHTML = $translate.instant('advisoryBoardMember2Bio');
		}
		else if($scope.member == 3)
		{
			$("#memberPhoto").attr("src","../../../img/AdvisoryBoard/Dr.%20Mona%20El%20Baradei.png");
			document.getElementById("memberName").innerHTML = $translate.instant('advisoryBoardMember3');
			document.getElementById("memberBio").innerHTML = $translate.instant('advisoryBoardMember3Bio');
		}
		else if($scope.member == 4)
		{
			$("#memberPhoto").attr("src","../../../img/AdvisoryBoard/Dr.%20Sherifa%20Sherif.jpg");
			document.getElementById("memberName").innerHTML = $translate.instant('advisoryBoardMember4');
			document.getElementById("memberBio").innerHTML = $translate.instant('advisoryBoardMember4Bio');
		}
		else if($scope.member == 5)
		{
			$("#memberPhoto").attr("src",".../../../img/Team/Dr.%20Heba%20Medhat%20Zaki,%20Founder%20and%20CEO.jpg");
			document.getElementById("memberName").innerHTML = $translate.instant('advisoryBoardMember5');
			document.getElementById("memberBio").innerHTML = $translate.instant('advisoryBoardMember5Bio');
		}
		else if($scope.member == 6)
		{
			$("#memberPhoto").attr("src","../../../img/AdvisoryBoard/Dr.%20Amr%20Talaat.jpg");
			document.getElementById("memberName").innerHTML = $translate.instant('advisoryBoardMember6');
			document.getElementById("memberBio").innerHTML = $translate.instant('advisoryBoardMember6Bio');
		}
		else if($scope.member == 7)
		{
			$("#memberPhoto").attr("src","../../../img/AdvisoryBoard/Ms.%20Nelly%20Mahmoud.jpg");
			document.getElementById("memberName").innerHTML = $translate.instant('advisoryBoardMember7');
			document.getElementById("memberBio").innerHTML = $translate.instant('advisoryBoardMember7Bio');
		}
		else if($scope.member == 8)
		{
			$("#memberPhoto").attr("src","../../../img/AdvisoryBoard/Ms.%20Susanne%20Wardani.jpg" );
			document.getElementById("memberName").innerHTML = $translate.instant('advisoryBoardMember8');
			document.getElementById("memberBio").innerHTML = $translate.instant('advisoryBoardMember8Bio');
		}
		else if($scope.member == 9)
		{
			$("#memberPhoto").attr("src","../../../img/AdvisoryBoard/Ms.%20Neveen-El-Tahri.png");
			document.getElementById("memberName").innerHTML = $translate.instant('advisoryBoardMember9');
			document.getElementById("memberBio").innerHTML = $translate.instant('advisoryBoardMember9Bio');
		}
		else if($scope.member == 10)
		{
			$("#memberPhoto").attr("src","../../../img/AdvisoryBoard/Mr.%20Tarek%20Mansour.jpg");
			document.getElementById("memberName").innerHTML = $translate.instant('advisoryBoardMember10');
			document.getElementById("memberBio").innerHTML = $translate.instant('advisoryBoardMember10Bio');
		}
		else if($scope.member == 11)
		{
			$("#memberPhoto").attr("src","../../../img/AdvisoryBoard/Dr.%20Iman%20Bibars.jpg");
			document.getElementById("memberName").innerHTML = $translate.instant('advisoryBoardMember11');
			document.getElementById("memberBio").innerHTML = $translate.instant('advisoryBoardMember11Bio');
		}
	});

});