precision mediump float;

#pragma phaserTemplate(shaderName)
#pragma phaserTemplate(fragmentDefine)
#pragma phaserTemplate(fragmentHeader)

uniform sampler2D uMainSampler;
uniform float uThickness;
uniform vec3 uColor;
uniform vec2 uResolution;

varying vec2 outTexCoord;

void main(void) {
  vec2 texel = vec2(1.0 / uResolution.x, 1.0 / uResolution.y);
  vec4 current = texture2D(uMainSampler, outTexCoord);
  float alpha = current.a;

  for(float x = -8.0; x <= 8.0; x += 1.0) {
    for(float y = -8.0; y <= 8.0; y += 1.0) {
      if(length(vec2(x, y)) <= uThickness) {
        alpha = max(alpha, boundedSampler(uMainSampler, outTexCoord + vec2(x, -y) * texel).a);
      }
    }
  }

  if(alpha > 0.5 && current.a < 0.5) {
    gl_FragColor = vec4(uColor, 1.0);
  } else {
    gl_FragColor = current;
  }
}
