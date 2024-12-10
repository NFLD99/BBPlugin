(function () {
    Plugin.register('split_model_knife_tool', {
        title: 'Split Model with Knife Tool',
        author: 'MrFluff',
        description: 'Splits selected cubes into 16x16x16 sections, preserving geometry and textures.',
        icon: 'scatter_plot',
        version: '1.9.0',
        min_version: '4.11.2',
        variant: 'both',
        onload() {
            let action = new Action({
                id: 'split_model_knife',
                name: 'Split Model with Knife Tool',
                description: 'Split the selected cubes into 16x16x16 sections.',
                icon: 'content_cut',
                condition: () => Cube.selected.length > 0,
                click() {
                    console.log('Action triggered: Split Model with Knife Tool');
                    let selectedCubes = Cube.selected;
                    if (selectedCubes.length === 0) {
                        Blockbench.showMessageBox({
                            title: 'No Cubes Selected',
                            message: 'Please select at least one cube to split.',
                        });
                        return;
                    }
                    Undo.initEdit({ elements: selectedCubes });
                    selectedCubes.forEach(cube => {
                        try {
                            console.log('Processing cube:', cube.name);  // Added logging
                            let { from, to } = cube;
                            console.log('Cube from:', from, 'Cube to:', to);
                            if (!from || !to || from.length !== 3 || to.length !== 3) {
                                console.error('Invalid cube dimensions for cube:', cube.name);
                                return;
                            }
                            let xSplits = Array.from({ length: Math.ceil((to[0] - from[0]) / 16) + 1 },
                                (_, i) => Math.min(from[0] + i * 16, to[0]));
                            let ySplits = Array.from({ length: Math.ceil((to[1] - from[1]) / 16) + 1 },
                                (_, i) => Math.min(from[1] + i * 16, to[1]));
                            let zSplits = Array.from({ length: Math.ceil((to[2] - from[2]) / 16) + 1 },
                                (_, i) => Math.min(from[2] + i * 16, to[2]));
                            let groupIndex = 0;
                            for (let x = 0; x < xSplits.length - 1; x++) {
                                for (let y = 0; y < ySplits.length - 1; y++) {
                                    for (let z = 0; z < zSplits.length - 1; z++) {
                                        let segmentFrom = [
                                            xSplits[x],
                                            ySplits[y],
                                            zSplits[z],
                                        ];
                                        let segmentTo = [
                                            xSplits[x + 1],
                                            ySplits[y + 1],
                                            zSplits[z + 1],
                                        ];
                                        let newFaces = {};
                                        for (let face in cube.faces) {
                                            let originalFace = cube.faces[face];
                                            if (!originalFace) continue;
                                            newFaces[face] = {
                                                ...originalFace,
                                                uv: [...originalFace.uv],
                                            };
                                        }
                                        let newCube = new Cube({
                                            name: `cube_${x}-${y}-${z}`,
                                            from: segmentFrom,
                                            to: segmentTo,
                                            faces: newFaces,
                                            rotation: cube.rotation,
                                            origin: cube.origin,
                                            visibility: cube.visibility,
                                        });
                                        newCube.addTo();
                                        if (!Cube.groups[groupIndex]) {
                                            Cube.groups[groupIndex] = new Group({
                                                name: `${groupIndex}-${groupIndex + 1}`,
                                            });
                                        }
                                        Cube.groups[groupIndex].add(newCube);
                                        groupIndex++;
                                    }
                                }
                            }
                            cube.remove();
                        } catch (error) {
                            console.error('Error processing cube:', cube.name, error);
                        }
                    });
                    Undo.finishEdit('Split cubes into 16x16x16 sections');
                    console.log('Split operation completed.');
                },
            });
            MenuBar.addAction(action, 'filter');
        },
        onunload() {
            MenuBar.removeAction('split_model_knife');
        },
    });
})();
