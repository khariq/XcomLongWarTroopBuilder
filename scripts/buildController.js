
xcomApp.controller('xcomController', function($scope, $http, DataService) {

	DataService.getCommonJson().then (
        // success
        function (commonJson) { //success
			$scope.menuItems = commonJson.classes;

			$scope.soliders = commonJson.classes.filter(function (_class) { return _class.mec !== 1 && _class.shiv !== 1; });
			$scope.mecTroopers = commonJson.classes.filter(function (_class) { return _class.mec !== null && _class.mec === 1; });
			$scope.shivs = commonJson.classes.filter(function (_class) { return _class.shiv !== null && _class.shiv === 1; });

			$scope.tabs = commonJson.tabs;
			$scope.ranks = commonJson.ranks;
			$scope.armors = commonJson.armors;

			$scope.commonJson = commonJson;
		}, 
        // failure
        function (commonJson) {
		
		}
	);

	DataService.getPsionics().then (
		function(psionicsJson) {
			
			$scope.psionicsPerks = psionicsJson.psionics;
		},
		function (psionicsJson) {

		}
	);

	DataService.getGeneMods().then (
		function(json) {
			$scope.geneMods = json.gene_mods;
		},
		function(json) {

		}
	);

	$scope.isActive = function (id) {
		return ($scope.class != null && $scope.class.id === id);
	}

	$scope.isClassMec = function () {
		return $scope.class != null && $scope.class.mec != null && $scope.class.mec === 1;
	}

	$scope.isClassShiv = function () {
		return $scope.class != null && $scope.class.shiv != null && $scope.class.shiv === 1;
	}

	$scope.showTab = function(tabName) {
		$scope.visibleTab = tabName;

	}

	$scope.hideTab = function (tabName) {
		return (
			(tabName === 'psionics' || tabName === 'gene') && $scope.isClassMec() ||
			(tabName === 'psionics' || tabName === 'gene' || tabName === 'perks') && $scope.isClassShiv()
			);
	}

	$scope.filterEquipment = function () {
		DataService.getCommonJson().then(
			// success
			function (commonJson) { //success

				var equipment = Enumerable.From(commonJson.items).ToArray();

				$scope.equipment = equipment.filter(function (item) {
					if ($scope.class.mec === 1) {
						return  item.classes.indexOf('mec') >= 0;
					}
					else if ($scope.class.shiv === 1) {
						return  item.classes.indexOf('shiv') >= 0;	
					}
					else {
						return  item.classes === '' ||
								item.classes.indexOf($scope.class.id) >= 0 ||
								(
									item.classes.indexOf('psionic') >= 0 &&
									$scope.selectedPsionicPerks != null &&
									$scope.selectedPsionicPerks.length > 0
								);
					}
				});
			},
			function(error){}
		);
	}

	$scope.eqSlotOnePerk = null;
	$scope.eqSlotTwoPerk = null;

	$scope.equipmentChanged = function() {
		
		if ($scope.equipmentSlotOne == null) {
			if ($scope.eqSlotOnePerk != null) {

				$scope.losePerk(-1, $scope.eqSlotOnePerk);
			}
		}
		else if ($scope.equipmentSlotOne.perk != null) {
			if ($scope.eqSlotOnePerk != null) {
				$scope.losePerk(-1, $scope.eqSlotOnePerk);
			}

			var perk = $scope.commonJson.perks.filter(function(p){return p.id === $scope.equipmentSlotOne.perk;})[0];

			$scope.gainPerk(-1, perk);
			$scope.eqSlotOnePerk = perk;
		}

		if ($scope.equipmentSlotTwo == null) {
			if ($scope.eqSlotTwoPerk != null) {
				$scope.losePerk($scope.eqSlotTwoPerk);
			}
		}
		else if ($scope.equipmentSlotTwo.perk != null) {
			if ($scope.eqSlotTwoPerk != null) {
				$scope.losePerk($scope.eqSlotTwoPerk);
			}
			var perk = $scope.commonJson.perks.filter(function(p){return p.id === $scope.equipmentSlotTwo.perk;})[0];

			$scope.gainPerk(-1, perk);
			$scope.eqSlotOnePerk = perk;
		}

		$scope.showVisibleOutput();
	}
	
	$scope.resetBuild = function() {
		$scope.build  = {

			"hp" : 5,
			"armor" : 0,
			"mobility" : 13,
			"aim" : 65,
			"will" : 35,
			"defense" : 0,
			"damage_reduction" : 0,
			"mod" : {
				"aim" : 0,
				"mob" : 0,
				"will" : 0
			},
			"rank_ups" : {
				"health" : 0,
				"aim" : 0,
				"will_low" : 0,
				"will_high" : 0	
			},
			"damage_bonus" : 0,
			"secondary_damage_bonus" : 0,
			"primary_damage_bonus" : 0
		};

		$scope.selectedClass = null;
		$scope.selectedGeneMods = [];
		$scope.selectedPsionicPerks = [];
		$scope.selectedPrimaryWeapon = null;
		$scope.selectedSecondaryWeapon = null;
		$scope.selectedSecondaryWeapons = [];
		$scope.selectedEqipment = [];
		$scope.icons = [];
		$scope.selectedPerks = [];
	}

	$scope.showClass = function(id) {
		$scope.resetBuild();

		$scope.selectedClass = id;

		DataService.getCommonJson().then (
            // success
            function (commonJson) {
				
            	var classJson = DataService.getClassJson(id);

            	$scope.class = classJson;

            	$scope.selectedArmor = $scope.commonJson.armors.filter(function(ar) { return ar.name === "Tac Vest" } )[0];

				for (var i = 0; i < classJson.spec.perks.length; i++) {
					$scope.perks[i] = [];
					for (var j = 0; j < classJson.spec.perks[i].perks.length; j++) {
						
						for (var k = 0; k < commonJson.perks.length; k++) {							
							if (commonJson.perks[k].id === classJson.spec.perks[i].perks[j].id) {

								$scope.perks[i][j] = commonJson.perks[k];

								if (i == 0) {
									$scope.choosePerk(commonJson.perks[k], i, null);
								}

								break;
							}
						}

					}
				}

				$scope.primaryWeapons = [];
				var primaryWeapons = Enumerable.From(commonJson.primary_weapons);
				for (var i = 0; i < classJson.spec.primary_weapons.length; i++) {
				    var weaponClass = Object.keys(classJson.spec.primary_weapons[i])[0];
				    var weapons = primaryWeapons.Where("$.type == '" + weaponClass + "'").Select("$.weapons").ToArray()[0];
				    if (weapons != null && weapons.length > 0) {
				    	$scope.primaryWeapons = $scope.primaryWeapons.concat(weapons);
				    }
				}
				$scope.selectedPrimaryWeapon = $scope.primaryWeapons.filter(function(w) { return w.id === $scope.class.default_primary_weapon; })[0];

				$scope.secondaryWeapons = [];
				var secondaryWeapons = Enumerable.From(commonJson.secondary_weapons);
				for (var i = 0; i < classJson.spec.secondary_weapons.length; i++) {
				    var weaponClass = Object.keys(classJson.spec.secondary_weapons[i])[0];
				    var weapons = secondaryWeapons.Where("$.type == '" + weaponClass + "'").Select("$.weapons").ToArray()[0];
				    if (weapons != null && weapons.length > 0) {
				    	$scope.secondaryWeapons = $scope.secondaryWeapons.concat(weapons);
				    }
				}
				$scope.selectedSecondaryWeapon = $scope.secondaryWeapons.filter(function(w) { return w.id === $scope.class.default_secondary_weapon; })[0];
				
				$scope.filterEquipment();

				DataService.getCommonJson().then(
					// success
					function (commonJson) { //success
						$scope.armors = commonJson.armors;
						if ($scope.isClassMec()) {
							$scope.armors = $scope.armors.filter(function (armor) {
								return armor.type === "MEC Armor";
							});
						} else {
							$scope.armors = $scope.armors.filter(function (armor) {
								return armor.type !== "MEC Armor";
							});
						}
						
					},
					// failure
					function (commonJson) {

					}
				);

				if ($scope.isClassShiv()) {
					$scope.visibleTab = "armory";

					$scope.build.aim = 70;
					switch ($scope.class.name)
					{
						case "S.H.I.V.": {
							$scope.build.hp = 8;
							$scope.build.mobility = 17;
							$scope.build.defense = 10;
							$scope.build.damage_reduction = 1.5;
						}
						case "Alloy S.H.I.V.":{
							$scope.build.hp = 22;
							$scope.build.mobility = 16;
							$scope.build.defense = 15;
							$scope.build.damage_reduction = 2.5;
						}
						case "Hover S.H.I.V." : {
							$scope.build.hp = 18;
							$scope.build.mobility = 20;
							$scope.build.defense = 20;
							$scope.build.damage_reduction = 2;
						}
					}
				} else {
					$scope.visibleTab = "perks";
				}

				$scope.showOutput($scope.visibleOutput);
			},
            // failure
            function (commonJson) {

			}
		);
	}

	$scope.findClassPerk = function(perkId) {

		var classPerk = null;

		for (var i = 0; i < $scope.class.spec.perks.length; i++){
			for (var j = 0; j < $scope.class.spec.perks[i].perks.length; j++) {
				if ($scope.class.spec.perks[i].perks[j].id === perkId) {
					classPerk = $scope.class.spec.perks[i].perks[j];
					break;
				}
			}
			if (classPerk != null) break;
		}

		return classPerk;
	}

	$scope.gainPerk = function(idx, perk) {

		var classPerk = $scope.findClassPerk(perk.id);

		if (classPerk != null) {
			if (classPerk.aim != null) {
				$scope.build.mod.aim += classPerk.aim;
			}
			if (classPerk.mobility != null) {
				$scope.build.mod.mob += classPerk.mobility;
			}
			if (classPerk.will != null) {
				$scope.build.mod.will += classPerk.will;
			}
			if (classPerk.damage_bonus != null) {
				$scope.build.damage_bonus += classPerk.damage;
			}
			if (classPerk.primary_damage_bonus != null) {
				$scope.build.primary_damage_bonus += classPerk.primary_damage_bonus;
			}
			if (classPerk.secondary_damage_bonus != null) {
				$scope.build.secondary_damage_bonus += classPerk.secondary_damage_bonus;	
			}
		}

		$scope.icons.push(
			{
		 		id: perk.id,
		 		img_url: perk.img_src,
		 		title: perk.title,
		 		description: perk.description
		 	}
		 );
		
		if (idx > 0) {
			$scope.selectedPerks[idx] = perk;
		}
		else {
			$scope.selectedPerks.push(perk);
		}
	}

	$scope.losePerk = function(idx, perk) {

		var classPerk = $scope.findClassPerk(perk.id);

		if (classPerk != null) {
			if (classPerk.aim != null) {
				$scope.build.mod.aim -= classPerk.aim;
			}
			if (classPerk.mobility != null) {
				$scope.build.mod.mob -= classPerk.mobility;
			}
			if (classPerk.will != null) {
				$scope.build.mod.will -= classPerk.will;
			}
			if (classPerk.damage_bonus != null) {
				$scope.build.damage_bonus -= classPerk.damage;
			}
			if (classPerk.primary_damage_bonus != null) {
				$scope.build.primary_damage_bonus -= classPerk.primary_damage_bonus;
			}
			if (classPerk.secondary_damage_bonus != null) {
				$scope.build.secondary_damage_bonus -= classPerk.secondary_damage_bonus;	
			}
		}

		$scope.icons = $scope.icons.filter(
			function(icon) { 
				return icon.id !== perk.id; 
			});

		if (idx > 0) {
			$scope.selectedPerks[idx] = null;
		}
		else {
			$scope.selectedPerks = $scope.selectedPerks.filter(function(p) { return p.id !== perk.id; });
		}
	}

	$scope.choosePerk = function(perk, rank, btnElement) {
	
		var stat_mods = $scope.class.spec.stat_progression[rank];

		if ($scope.selectedPerks[rank] != null) {
			//deselect currently selected perk at this rank

			var currentPerk = $scope.selectedPerks[rank];
			
			$scope.losePerk(rank, currentPerk);

			$scope.build.rank_ups.aim -= stat_mods.aim;
			$scope.build.rank_ups.will_low -= stat_mods.will_low;
			$scope.build.rank_ups.will_high -= stat_mods.will_high;
			$scope.build.rank_ups.health -= stat_mods.health;
		
			$("input[name='" + rank + "']").each(function(checkbox) { 
				var chk = $(this);
				chk.prop("checked", false);
				chk.parent().removeClass("active");
			});

			$scope.selectedPerks[rank] = null;			

			if (perk.id == currentPerk.id) {
				$scope.showVisibleOutput();
				return;
			} 

		}

		$scope.gainPerk(rank, perk);

		$scope.build.rank_ups.aim += stat_mods.aim;
		$scope.build.rank_ups.will_low += stat_mods.will_low;
		$scope.build.rank_ups.will_high += stat_mods.will_high;
		$scope.build.rank_ups.health += stat_mods.health;
		
		$scope.showOutput($scope.visibleOutput);
	}
	
	$scope.choosePsiPerk = function(perk, rank, btnElement) {

		if ($scope.selectedPsionicPerks[rank] != null) {

			var currentPerk = $scope.selectedPsionicPerks[rank];

			$("input[name='psi" + rank + "']").each(function(checkbox) { 
				var chk = $(this);
				chk.prop("checked", false);
				chk.parent().removeClass("active");
			});

			$scope.icons = $scope.icons.filter(
				function(icon) { 
					return icon.id !== currentPerk.id; 
				});

			$scope.selectedPsionicPerks[rank] = null;

			if (perk.id == currentPerk.id) return;
		}

		$scope.icons.push(
			{
		 		id: perk.id,
		 		img_url: perk.img_src,
		 		title: perk.title,
		 		description: perk.description
		 	}
		 );

		$scope.selectedPsionicPerks[rank] = perk;

		$scope.filterEquipment();

		$scope.showOutput($scope.visibleOutput);
	}

	$scope.chooseGeneMod = function(perk, rank, btnElement) {

		var currentPerk = $scope.icons.filter(
				function(icon) { 
					return icon.id === perk.id; 
				});

		if (currentPerk != null && currentPerk.length > 0) {

			$scope.icons = $scope.icons.filter(
					function (icon) {
						return icon.id !== perk.id;
					});

			$scope.selectedGeneMods = $scope.selectedGeneMods.filter(
					function (geneMod) {
						return geneMod.id !== perk.id
					});
		} else {

			$scope.icons.push(
				{
					id: perk.id,
					img_url: perk.img_src,
					title: perk.title,
					description: perk.description
				}
			 );

			$scope.selectedGeneMods.push(perk);
		}

		$scope.showOutput($scope.visibleOutput);
	}

	////////////////////////////////////////////////
	// evetns fired when a perk is hovered

	// show handler for a class perl
	$scope.showDetails = function(perk) {
		$scope.showPerkDetails = true;
		var classPerk = $scope.findClassPerk(perk.id);
		if (classPerk != null) {
			if (classPerk.aim != null) {
				perk.aim_bonus = classPerk.aim;
			} else {
				perk.aim_bonus = 0;
			}

			if (classPerk.will != null) {
				perk.will_bonus = classPerk.will;
			} else {
				perk.will_bonus = 0;
			}

			if (classPerk.mobility != null) {
				perk.mobility_bonus = classPerk.mobility;
			} else {
				perk.mobility_bonus = 0;
			}

		}
		$scope.perkInDetails = perk;
	}

	$scope.hideDetails = function() {
		$scope.showPerkDetails = false;
	}

	// show handler for a psi perk or a gene mod
	
	$scope.showDescription = function(description) {
		$scope.description = description;
		$scope.displayDescription = true;
	}

	$scope.hideDescription = function() {
		$scope.displayDescription = false;
	}
	////////////////////////////////////////////////

	////////////////////////////////////////////////
	// solider stat calculations
	$scope.baseHealth = function () {
		if ($scope.build == null || $scope.build.rank_ups == null)
			return 0;
		return $scope.build.hp + $scope.build.rank_ups.health;
	}

	$scope.bonusHealth = function () {
		
		var hp = 0;

		if ($scope.selectedArmor != null) {
			hp += $scope.selectedArmor.hp;

			var perk = $scope.selectedPerks.filter(function(p) { return p.id === "extra_conditioning"; });
			if (perk.length > 0) {
				switch ($scope.selectedArmor.extra_conditioning) {
					case "light" : {
						hp += 1; 
						break;
					}
					case "medium" : {
						hp += 2;
						break;
					}
					case "heavy" : {
						hp += 4;
						break;
					}
				}
			}
		}

		if ($scope.equipmentSlotOne != null) {
			hp += $scope.equipmentSlotOne.hp;
		}

		if ($scope.equipmentSlotTwo != null) {
			hp += $scope.equipmentSlotTwo.hp;
		}

		return hp;
	}

	$scope.bonusWill = function () {
		var will = 0;
		if ($scope.selectedArmor != null) {
			will += $scope.selectedArmor.will;
		}
		if ($scope.equipmentSlotOne != null) {
			will += $scope.equipmentSlotOne.will;
		}

		if ($scope.equipmentSlotTwo != null) {
			will += $scope.equipmentSlotTwo.will;
		}

		if ($scope.build != null && $scope.build.mod != null && $scope.build.mod.will != null) {
			will += $scope.build.mod.will;
		}

		return will;
	}

	$scope.lowWill = function () {
		if ($scope.build == null || $scope.build.rank_ups == null)
			return 0;
		return $scope.build.will + $scope.build.rank_ups.will_low + $scope.bonusWill();
	}

	$scope.highWill = function () {
		if ($scope.build == null || $scope.build.rank_ups == null)
			return 0;
		return $scope.build.will + $scope.build.rank_ups.will_high + $scope.bonusWill();
	}

	$scope.defense = function () {
		
		if ($scope.build == null || $scope.build.rank_ups == null)
			return 0;
		var defense = 0;

		if ($scope.selectedArmor != null) {
			defense += $scope.selectedArmor.defense;
		}

		if ($scope.equipmentSlotOne != null && $scope.equipmentSlotOne.defense != null) {
			defense += $scope.equipmentSlotOne.defense;
		}

		if ($scope.equipmentSlotTwo != null && $scope.equipmentSlotTwo.defense != null) {
			defense += $scope.equipmentSlotTwo.defense;
		}
		return $scope.build.defense + defense;
	}
	
	$scope.damageReduction = function () {
		
		if ($scope.build == null || $scope.build.rank_ups == null)
			return 0;
		var damage_reduction = 0;

		if ($scope.selectedArmor != null) {
			damage_reduction += $scope.selectedArmor.damage_reduction;
		}

		if ($scope.equipmentSlotOne != null) {
			damage_reduction += $scope.equipmentSlotOne.damage_reduction;
		}

		if ($scope.equipmentSlotTwo != null) {
			damage_reduction += $scope.equipmentSlotTwo.damage_reduction;
		}

		if ($scope.selectedGeneMods != null) {
			var dr_mods = $scope.selectedGeneMods.filter(function(mod) { return mod.damage_reduction !== null; });
			for (var i = 0; i < dr_mods.length; i++) {
				damage_reduction += dr_mods[i].damage_reduction;
			}
		}

		return $scope.build.damage_reduction + damage_reduction;
	}

	$scope.aim = function () {
		
		if ($scope.build == null || $scope.build.rank_ups == null)
			return 0;
		var aim = 0
		if ($scope.selectedPrimaryWeapon != null) {
			aim += $scope.selectedPrimaryWeapon.aim_mod;
		}

		if ($scope.equipmentSlotOne != null) {
			aim += $scope.equipmentSlotOne.aim;
		}

		if ($scope.equipmentSlotTwo != null) {
			aim += $scope.equipmentSlotTwo.aim;
		}

		if ($scope.build.mod != null) {
			aim += $scope.build.mod.aim;
		}

		if ($scope.build.rank_ups != null) {
			aim += $scope.build.rank_ups.aim;
		}

		return $scope.build.aim + aim;
	}

	$scope.mobility = function () {
		
		if ($scope.build == null || $scope.build.rank_ups == null)
			return 0;

		var mobility = 0
		if ($scope.selectedArmor != null) {
			mobility += $scope.selectedArmor.mobility;
		}

		if ($scope.equipmentSlotOne != null) {
			mobility += $scope.equipmentSlotOne.mobility;
		}

		if ($scope.equipmentSlotTwo != null) {
			mobility += $scope.equipmentSlotTwo.mobility;
		}

		return $scope.build.mobility + $scope.build.mod.mob + mobility;
	}
	////////////////////////////////////////////////

	////////////////////////////////////////////////
	// Build exporting
	$scope.showVisibleOutput = function () {
		$scope.showOutput($scope.visibleOutput);
	}

	$scope.showOutput = function (type) {
		$scope.visibleOutput = type;

		switch (type) {
			case 'html': { $scope.formatted_build = $scope.buildHTMLOutput(); break; }
			case 'text': { $scope.formatted_build = $scope.buildTextOutput(); break; }
			case 'markdown': { $scope.formatted_build = $scope.buildMarkdownOutput(); break; }
		} 

	}

	$scope.buildMarkdownOutput = function () {
		var markup = '';
		if ($scope.class != null) {
			
			markup += $scope.class.name + '\r\n\r\n';
			markup += '**Stats**\r\n\r\n';
			markup += 'HP|Defense|DR|Will|Aim|Mobility\r\n';
			markup += ':-|:------|:-|:---|:--|:-------\r\n';

			markup += $scope.baseHealth() + ' + ' + $scope.bonusHealth() + '|';
			markup += $scope.defense() + '|';
			markup += $scope.damageReduction() + '|';
			markup += $scope.lowWill() + ' - ' + $scope.highWill() + '|';
			markup += $scope.aim() + '|';
			markup += $scope.mobility() + '\r\n';

			markup += '**Equipment**\r\n\r\n';
			markup += 'Slot|Item|Description\r\n'
			markup += ':-|:-|:-\r\n';
			if ($scope.selectedArmor != null) {
				markup += 'Armor|';
				markup += $scope.selectedArmor.name + '|';
				if ($scope.selectedArmor.notes != null) {
					markup += $scope.selectedArmor.notes;
				}
				markup += '\r\n';
			}

			if ($scope.selectedPrimaryWeapon != null) {
				markup += 'Primary Weapon|';
				markup += $scope.selectedPrimaryWeapon.name + '|';
				if ($scope.selectedPrimaryWeapon.notes != null) {
					markup += $scope.selectedPrimaryWeapon.notes;
				}
				markup += '\r\n';
			}

			if ($scope.selectedSecondaryWeapon != null) {
				markup += 'Side Arm|';
				markup += $scope.selectedSecondaryWeapon.name + '|';
				if ($scope.selectedSecondaryWeapon.notes != null) {
					markup += $scope.selectedSecondaryWeapon.notes;
				}
				markup += '\r\n';
			}

			if ($scope.equipmentSlotOne != null) {
				markup += 'Equipment (1)|';
				markup += $scope.equipmentSlotOne.name + '|';
				if ($scope.equipmentSlotOne.notes != null) {
					markup += $scope.equipmentSlotOne.notes;
				}
				markup += '\r\n';
			}

			if ($scope.equipmentSlotTwo != null) {
				markup += 'Equipment (2)|';
				markup += $scope.equipmentSlotTwo.name + '|';
				if ($scope.equipmentSlotTwo.notes != null) {
					markup += $scope.equipmentSlotTwo.notes;
				}
				markup += '\r\n';
			}

			markup += '\r\n';

			markup += '**' + $scope.class.name + ' Perks**\r\n\r\n';
			markup += 'Name|Description|Aim|Will|Mobility|Damage Bonus\r\n';
			markup += ':-|:-|:-|:-|:-|:-\r\n';
			for (var i = 0; i < $scope.selectedPerks.length; i++) {
				if ($scope.selectedPerks[i] != null) {
					markup += $scope.selectedPerks[i].title + '|';
					markup += $scope.selectedPerks[i].description + '|';
					markup += $scope.selectedPerks[i].aim_bonus + '|';
					markup += $scope.selectedPerks[i].will_bonus + '|';
					markup += $scope.selectedPerks[i].mobility_bonus + '|';
					markup += $scope.selectedPerks[i].damage_bonus;
					markup += '\r\n';
				}
			}
			markup += '\r\n';
			markup += '\r\n';
			markup += '**Psi Perks**\r\n\r\n';
			markup += 'Name|Description\r\n';
			markup += ':-|:-\r\n';
			if ($scope.selectedPsionicPerks.length > 0) {
				for (var i = 0; i < $scope.selectedPsionicPerks.length; i++) {
					if ($scope.selectedPsionicPerks[i] != null) {
						markup += $scope.selectedPsionicPerks[i].name + '|';
						markup += $scope.selectedPsionicPerks[i].description;
						markup += '\r\n';
					}
				}
			}
			else {
				markup += 'None';
			}
			markup += '\r\n';
			markup += '\r\n';
			markup += '**Gene Mods**\r\n\r\n';
			markup += 'Name|Description\r\n';
			markup += ':-|:-\r\n';
			if ($scope.selectedGeneMods.length > 0) {
				for (var i = 0; i < $scope.selectedGeneMods.length; i++) {
					if ($scope.selectedGeneMods[i] != null) {
						markup += $scope.selectedGeneMods[i].name + '|';
						markup += $scope.selectedGeneMods[i].description;
						markup += '\r\n';
					}
				}
			}
			else {
				markup += 'None';
			}
			
		}
		return markup;
	}


	$scope.buildTextOutput = function () {
		var markup = '';
		if ($scope.class != null) {
			
			markup += $scope.class.name + '\r\n\r\n';
			markup += 'Stats\r\n';
			markup += 'HP: ' + $scope.baseHealth() + ' + ' + $scope.bonusHealth()+ '\r\n';
			markup += 'Defense: ' + $scope.defense()+ '\r\n';
			markup += 'Damage Reduction: ' + $scope.damageReduction()+ '\r\n';
			markup += 'Will: ' + $scope.lowWill() + ' - ' + $scope.highWill()+ '\r\n';
			markup += 'Aim: ' + $scope.aim() + '\r\n';
			markup += 'Mobility: ' + $scope.mobility() + '\r\n';

			markup += 'Equipment\r\n';

			if ($scope.selectedArmor != null) {
				markup += $scope.selectedArmor.name + '\r\n';
			}

			if ($scope.selectedPrimaryWeapon != null) {
				markup += $scope.selectedPrimaryWeapon.name + '\r\n';
			}

			if ($scope.selectedSecondaryWeapon != null) {
				markup += $scope.selectedSecondaryWeapon.name + '\r\n';
			}

			if ($scope.equipmentSlotOne != null) {
				markup += $scope.equipmentSlotOne.name + '\r\n';
			}

			if ($scope.equipmentSlotTwo != null) {
				markup += $scope.equipmentSlotTwo.name + '\r\n';
			}

			markup += '\r\n';

			markup += $scope.class.name + ' Perks: ';

			for (var i = 0; i < $scope.selectedPerks.length; i++) {
				if ($scope.selectedPerks[i] != null) {
					markup += $scope.selectedPerks[i].title;
					if (i < $scope.selectedPerks.length - 1)
						markup += ', ';
				}
			}
			markup += '\r\n';
			markup += 'Psi Perks: ';
			if ($scope.selectedPsionicPerks.length > 0) {
				for (var i = 0; i < $scope.selectedPsionicPerks.length; i++) {
					if ($scope.selectedPsionicPerks[i] != null) {
						markup += $scope.selectedPsionicPerks[i].name;
						if (i < $scope.selectedPsionicPerks.length - 1)
							markup += ', ';
					}
				}
			}
			else {
				markup += 'None';
			}
			markup += '\r\n';
			markup += '\r\n';
			markup += 'Gene Mods: ';
			if ($scope.selectedGeneMods.length > 0) {
				for (var i = 0; i < $scope.selectedGeneMods.length; i++) {
					if ($scope.selectedGeneMods[i] != null) {
						markup += $scope.selectedGeneMods[i].name;
						if (i < $scope.selectedGeneMods.length - 1)
							markup += ', ';
					}
				}
			}
			else {
				markup += 'None';
			}
			
		}
		return markup;
	}
	////////////////////////////////////////////////

	////////////////////////////////////////////////
	// Member properties
	$scope.menuItems = [];
	$scope.tabs = [];

	$scope.ranks = [];

	$scope.build = {};
	$scope.showPerkDetails = false;
	$scope.perkInDetails = {};

	$scope.class = null;
	$scope.perks = [];
	$scope.armors = [];
	$scope.primaryWeapons = [];
	$scope.secondaryWeapons = [];
	$scope.equipment = [];
	$scope.visibleTab = "perks";
	$scope.icons = [];
	$scope.description = '';

	$scope.psionicsPerks = [];

	$scope.geneMods = [];

	$scope.selectedPerks = [];
	$scope.selectedGeneMods = [];
	$scope.selectedPsionicPerks = [];
	$scope.selectedPrimaryWeapon = null;
	$scope.selectedSecondaryWeapon = null;
	$scope.equipmentSlotOne = null;
	$scope.equipmentSlotTwo = null
	$scope.selectedSecondaryWeapons = [];
	$scope.selectedEqipment = [];
	$scope.selectedClass = null;
	$scope.selectedArmor = null;
	$scope.displayDescription = false;

	$scope.formatted_build = $scope.buildMarkdownOutput();
	$scope.visibleOutput = 'markdown';
	////////////////////////////////////////////////
});
