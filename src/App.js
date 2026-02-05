import * as THREE from 'three'
import { Suspense, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Preload, ScrollControls, Scroll, useScroll, Image as ImageImpl } from '@react-three/drei'
import { RevealText } from './Text'


export function Image({ radius = 0.12, c = new THREE.Color(), ...props }) {
  const ref = useRef(null);
  const [hovered, hover] = useState(false);

  useLayoutEffect(() => {
    if (!ref.current?.material) return;

    const mat = ref.current.material;

    // важно: чтобы discard/alpha работали корректно
    mat.transparent = true;

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uRadius = { value: radius };

      // 1) Вставляем SDF функцию
      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <common>`,
        `
        #include <common>
        uniform float uRadius;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 q = abs(p) - b + r;
          return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
        }
        `
      );

      // 2) Вставляем discard перед финальным выводом цвета.
      // Это гораздо стабильнее, чем искать dithering_fragment.
      // Используем vUv, но если в твоей версии он называется иначе — см. блок ниже.
      const token = `gl_FragColor = vec4( outgoingLight, diffuseColor.a );`;

      if (shader.fragmentShader.includes(token)) {
        shader.fragmentShader = shader.fragmentShader.replace(
          token,
          `
          vec2 uv = vUv - 0.5;
          float d = roundedBoxSDF(uv, vec2(0.5), uRadius);
          if (d > 0.0) discard;

          ${token}
          `
        );
      } else {
        // fallback: если у материала другой вывод
        // пробуем вставиться перед последним include
        shader.fragmentShader = shader.fragmentShader.replace(
          `#include <output_fragment>`,
          `
          vec2 uv = vUv - 0.5;
          float d = roundedBoxSDF(uv, vec2(0.5), uRadius);
          if (d > 0.0) discard;

          #include <output_fragment>
          `
        );
      }

      // сохраним shader, чтобы можно было обновлять uRadius без пересборки
      (mat).userData.shader = shader;
    };

    mat.needsUpdate = true;

    return () => {
      mat.onBeforeCompile = null;
      delete (mat).userData.shader;
    };
  }, [radius]);

  // если хочешь менять radius динамически (например hover), обновляй uniform так:
  useFrame(() => {
    if (!ref.current?.material) return;

    ref.current.material.color.lerp(
      c.set(hovered ? "white" : "#ccc"),
      hovered ? 0.4 : 0.05
    );

    const shader = ref.current.material.userData?.shader;
    if (shader?.uniforms?.uRadius) {
      shader.uniforms.uRadius.value = radius; // или анимируй
    }
  });

  return (
    <ImageImpl
      ref={ref}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      {...props}
    />
  );
}

function Images() {
  const { width, height } = useThree((state) => state.viewport)
  const data = useScroll()
  const group = useRef()
  useFrame(() => {
    group.current.children[0].material.zoom = 1 + data.range(0, 1 / 3) / 3
    group.current.children[1].material.zoom = 1 + data.range(0, 1 / 3) / 3
    group.current.children[2].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 3
    group.current.children[3].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2
    group.current.children[4].material.zoom = 1 + data.range(1.25 / 3, 1 / 3) / 1
    group.current.children[5].material.zoom = 1 + data.range(1.8 / 3, 1 / 3) / 3
    group.current.children[5].material.grayscale = 1 - data.range(1.6 / 3, 1 / 3)
    group.current.children[6].material.zoom = 1 + (1 - data.range(2 / 3, 1 / 3)) / 3
  })
  return (
    <group ref={group}>
      <Image opacity={0} position={[0, 0, 0]} scale={[4, height, 1]} url="/img1.jpg" />
      <Image position={[0, 1, 0]} scale={3} url="/img6.jpg" />
      <Image position={[2.5, -height * 0.7, 2]} scale={[1, 4, 2]} url="/img9.jpg" />

      <Image position={[-2.3, -height - 4, 2]} scale={[1, 3, 1]} url="/trip2.jpg" />
      <Image position={[-0.6, -height - 4, 3]} scale={[1, 2, 1]} url="/img8.jpg" />
      <Image position={[0.75, -height - 4, 3.5]} scale={1.5} url="/trip4.jpg" />
      <Image position={[0, -height * 1.5 - 2, 2.5]} scale={[1.5, 3, 1]} url="/img3.jpg" />
      <Image position={[0, -height * 2 - height / 4, 0]} scale={[width, height / 2, 1]} url="/img7.jpg" />
    </group>
  )
}

export default function App() {
  return (
    <Canvas gl={{ antialias: false }} dpr={[1, 1.5]}>
      <Suspense fallback={null}>
        <ScrollControls damping={4} pages={3}>
          <Scroll>
            <Images />
          </Scroll>
          <Scroll html>
            <div style={{ position: 'absolute', top: '60vh', left: '0.5em' }}><RevealText delay={0.4} text="Denys Kozak"/></div>
            <div style={{ position: 'absolute', top: '60vh', left: '50vw' }}><RevealText delay={0.8} text="Senior Engineer"/></div>
            <div style={{ position: 'absolute', top: '90vh', left: '0.5em', width: '90vw' }}><RevealText as="h3" delay={1} text="Over 12 years build, scale, grow applications"/></div>
            <div style={{ position: 'absolute', top: '100vh', left: '0.5em', width: '80vw' }}><RevealText as="h3" delay={0.5} text="Web, Mobile, Blockchain environment"/></div>
            <div style={{ position: 'absolute', top: '110vh', left: '0.5em', width: '80vw' }}><RevealText as="h3" delay={0.5}  text="10 millions user micro-frontends experience"/></div>
            <div style={{ position: 'absolute', top: '125vh', left: '0.5em', width: '80vw' }}>
              <RevealText as="h3" delay={0.5} text="Tech:"/> <br />
              <RevealText as="h3" delay={0.5} text="- React | Typescript | NextJS | Astro | Micro-frontends"/><br />
              <RevealText as="h3" delay={0.5} text="- NodeJS | Express | gRPC | NestJS | AWS | Postgres"/> <br />
              <RevealText as="h3" delay={0.5} text="- Move | Rust | Sui | Walrus | Telegram-mini App"/><br />
            </div>
            {/*<h3 style={{ position: 'absolute', top: '200vh', left: '0.5em', width: '80vw' }}>Concepts: SEO | SSR | CI/CD | System Design</h3>*/}
            {/*<div style={{ position: 'absolute', top: '180vh', left: '0.5em', width: '80vw' }}>Focus</div>*/}

            <h1 style={{ position: 'absolute', top: '200vh', left: '60vw' }}>Projects:</h1>
            <h1 style={{ position: 'absolute', top: '240.5vh', left: '0.5vw', fontSize: '40vw' }}>home</h1>
          </Scroll>
        </ScrollControls>
        <Preload />
      </Suspense>
    </Canvas>
  )
}
