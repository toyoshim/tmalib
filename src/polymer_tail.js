    this.tma = tma;
    this.TmaScreen = TmaScreen;
    this.Tma2DScreen = Tma2DScreen;
    this.Tma3DScreen = Tma3DScreen;
    this.TmaModelPrimitives = TmaModelPrimitives;
    this.TmaParticle = TmaParticle;
    this.TmaSequencer = TmaSequencer;
    this.TmaMotionBvh = TmaMotionBvh;
    this.TmaModelPly = TmaModelPly;
    this.TmaModelPs2Ico = TmaModelPs2Ico;

    this.createScreen = function (width, height, mode) {
      return new TmaScreen(width, height, mode);
    };
    this.createBox = TmaModelPrimitives.createBox;
    this.createCube = TmaModelPrimitives.createCube;
    this.createPoints = TmaModelPrimitives.createPoints;
    this.createSphere = TmaModelPrimitives.createSphere;
  }
});
