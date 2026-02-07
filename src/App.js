import * as THREE from 'three'
import { Suspense, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Gltf,
  Preload,
  ScrollControls,
  Scroll,
  useScroll,
  Image as ImageImpl,
  Environment,
  ContactShadows
} from '@react-three/drei'
import { RevealText } from './Text'
import { Floating } from './Floating'
import { Laptop } from './Laptop'
import { useMediaQuery } from 'react-responsive'

export function Image({ radius = 0.12, c = new THREE.Color(), ...props }) {
  const ref = useRef(null)
  const [hovered, hover] = useState(false)

  useLayoutEffect(() => {
    if (!ref.current?.material) return

    const material = ref.current.material
    material.transparent = true

    material.onBeforeCompile = (shader) => {
      shader.uniforms.uRadius = { value: radius }

      shader.fragmentShader = shader.fragmentShader
        .replace(
          `#include <common>`,
          `
          #include <common>
          uniform float uRadius;

          float roundedBox(vec2 p, vec2 b, float r) {
            vec2 q = abs(p) - b + r;
            return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
          }
          `
        )
        .replace(
          `#include <output_fragment>`,
          `
          // uv от 0..1 → в -1..1
          vec2 uv = vUv * 2.0 - 1.0;

          // размер прямоугольника
          float d = roundedBox(uv, vec2(1.0), uRadius);

          if (d > 0.0) discard;

          #include <output_fragment>
          `
        )

      material.userData.shader = shader
    }

    material.needsUpdate = true
  }, [])

  useFrame(() => {
    if (!ref.current?.material) return

    ref.current.material.color.lerp(
      c.set(hovered ? 'white' : '#ccc'),
      hovered ? 0.4 : 0.05
    )

    const shader = ref.current.material.userData?.shader
    if (shader?.uniforms?.uRadius) {
      shader.uniforms.uRadius.value = radius
    }
  })

  return (
    <ImageImpl
      ref={ref}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      {...props}
    />
  )
}

function Images() {
  const { width, height } = useThree((state) => state.viewport)
  const data = useScroll()
  const group = useRef()
  const angleRef = useRef(-29)
  const prevOffset = useRef(0)
  useFrame((state) => {
    const t = state.clock.elapsedTime


    // Общий прогресс секций

    // group.current.children[0].material.zoom = 1 + data.range(0, 1 / 3) / 3
    // group.current.children[1].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 3
    // group.current.children[2].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 3
    // group.current.children[3].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2

    const current = data.offset
    const delta = current - prevOffset.current

    angleRef.current += delta * Math.PI * 5 // чувствительность вращения

    group.current.children[2].rotation.z = angleRef.current
    prevOffset.current = current



    // опционально: поворачивать саму картинку по касательной
    // group.current.children[4].material.zoom = 1 + data.range(1.25 / 3, 1 / 3) / 1
    // group.current.children[5].material.zoom = 1 + data.range(1.8 / 3, 1 / 3) / 3
    // group.current.children[5].material.grayscale = 1 - data.range(1.6 / 3, 1 / 3)
    // group.current.children[6].material.zoom = 1 + (1 - data.range(2 / 3, 1 / 3)) / 3
  })

  return (
    <group ref={group}>
      <Image opacity={0} position={[0, 0, 0]} scale={[4, height, 1]} url="/img1.jpg" />
      <Image position={[0, 1.5, 0]} scale={3} url="/picture.webp" />
      {/*<Image position={[2.8, -height, 2]} scale={[1, 4, 2]} url="/img9.jpg" />*/}

      <Image position={[1.4, -height - 4, 2]} scale={[1.18, 1.15, 1]} url="/github.png" />

      <Laptop position={[2.5, -height * 0.5, 0.5]} rotation={[0, 0, 0]} scale={0.2} />
      {/*<Gltf src={'/macbook_air_m2.glb'} position={[1.4, -height - 4, 2]} scale={[1.18, 1.15, 1]} />*/}
      <Image opacity={0} position={[-2.3, -height - 15, 2]} scale={[1, 3, 1]} url="/trip2.jpg" />
      <Image opacity={0} position={[-0.6, -height - 15, 3]} scale={[1, 2, 1]} url="/img8.jpg" />
      <Image opacity={0} position={[0.75, -height - 15, 3.5]} scale={1.5} url="/trip4.jpg" />
      <Image opacity={0} position={[0.75, -height - 30, 3.5]} scale={1} url="/rain.com.png" />
      <Image opacity={0} position={[0, -height * 1.5 - 10, 2.5]} scale={[1.5, 3, 1]} url="/img3.jpg" />
      <Image opacity={0} position={[0, -height * 3, 0]} scale={[width, height / 2, 1]} url="/img7.jpg" />
    </group>
  )
}

export default function App() {
  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 620px)'
  })

  return (
    <Canvas gl={{ antialias: false }} dpr={[1, 1.5]}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />

        <directionalLight position={[5, 5, 5]} intensity={2.2} />
        <directionalLight position={[-5, 2, 2]} intensity={1.2} />        <Environment preset="city" />
        <ScrollControls  pages={7}>
          <Scroll>
            <Images />
          </Scroll>
          <Scroll html>
            <div style={{ position: 'absolute', top: '55vh', left: '4em' }}><RevealText delay={0.4}
                                                                                          text="Denys Kozak" /></div>
            {isDesktopOrLaptop && <div style={{ position: 'absolute', top: '55vh', left: '50vw' }}><RevealText delay={0.8}
                                                                                         text="Frontend Lead" /></div>}
            {isDesktopOrLaptop && <div style={{ position: 'absolute', top: '90vh', left: '95vw' }} ><Floating><RevealText as="h5" delay={2}
                                                                                         text="Scroll Down" /></Floating></div>}
            <div style={{ position: 'absolute', top: '90vh', left: '4em', width: '90vw' }}>
              <RevealText as="h3" delay={1} text="Over 12 years delivering web and mobile products" /><br />
              <RevealText as="h3" delay={0.5} text="Frontend Engineer, Team Lead, Researcher" /><br />
              <RevealText as="h3" delay={1} text="Built micro-frontend platforms serving 10M+ users" />
            </div>
            {isDesktopOrLaptop && <><div style={{ position: 'absolute', top: '130vh', left: '4em', width: '60vw' }}>
              <RevealText as="h2" delay={0.5} text="Tech Stack:" /> <br />
              <RevealText as="h3" delay={1} text="React, Typescript, NextJS, Astro" /><br />
              <RevealText as="h3" delay={1.2} text="NodeJS, Express, gRPC, NestJS, AWS, Postgres" /> <br />
              <RevealText as="h3" delay={1.2} text="Move, Rust, Sui, Walrus, Telegram-mini App" /><br />
            </div>
            {/*<h3 style={{ position: 'absolute', top: '200vh', left: '0.5em', width: '80vw' }}>Concepts: SEO | SSR | CI/CD | System Design</h3>*/}
            {/*<div style={{ position: 'absolute', top: '180vh', left: '0.5em', width: '80vw' }}>Focus</div>*/}
            <div style={{ position: 'absolute', width: '50vw',  display: 'flex', flexDirection: 'column', top: '180vh', left: '4em'}}>
              <RevealText as="h2" delay={0.5} text="Github:" /><br />
              <RevealText as="h3" delay={0.5}
                                                                                  text="2,868 last year contributions" />
              <a style={{ marginLeft: 'auto'}} target="_blank" href="https://github.com/denyskozak"><RevealText as="h4" delay={0.5}
                                                                                                                   text="[Website Link]" /></a>
              <br />
              <RevealText as="h3" delay={0.5}
                                                                                      text="5000+ downloads npm packages" />
            <a style={{ marginLeft: 'auto'}} target="_blank" href="https://www.npmjs.com/denyskozak"><RevealText as="h4" delay={0.5}
                                                                                                       text="[Website Link]" /></a>
          </div>
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', top: '230vh', left: '4em', width: '80vw' }}>
                <h2>Top Latest Projects:</h2>
                <br />
                <div style={{ width: '40vw' }}>
                  <h3>Autodoc</h3>
                  <h4>
                    E-commercy. Delivering Vertical Micro-frontends architecture (SSR) framework-agnostic through HTML-over-the-wire approch to reach hundreds of parallel developmers splited into website parts (domains)
                  </h4>
                </div>
                <div style={{ marginTop: '10vh', marginLeft: 'auto', width: '40vw' }}>
                  <h3>Rain.com</h3>
                  <h4>
                    Rain is the first company in the Middle East to be licensed by the Central Bank of Bahrain in 2019. Rain is also licensed and regulated by the Abu Dhabi Global Market (ADGM) in the UAE in 2023
                  </h4>
                </div>
                <div style={{ marginTop: '10vh', width: '40vw' }}>
                  <h3>Gastro & Me</h3>
                  <h4>User interactive iOS application with infinity video feed, cooking voice assistant</h4>
                </div>
              </div>

              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', top: '370vh', left: '4em', width: '80vw' }}>
                <h1>Projects:</h1>
                <br />
                <br />

                <h3>Autodoc, Frontend Lead:</h3>
                <h5>E-commerce</h5>
                <h5>(Jan 2024 - Present) · 2 yrs 2 mos</h5>
                <h4>
                  Research, propotype, build and scale SSR Micro-frontends for 10+ millions monthly users, design and document frontend system, raised team DX, and mentored engineers
                </h4>

                <a style={{ marginLeft: 'auto' }} target="_blank" href="https://www.autodoc.de">
                  <h4>[Website Link]</h4>
                </a>

                <br />
                <br />

                <h3>Concentrix Tigerspike, Senior Frontend Developer</h3>
                <h5>Digital Assets Market</h5>
                <h5>(Jun 2021 - Nov 2023) · 2 yrs 6 mos</h5>
                <h4>
                  Shipped React based UI library for 120+ developers and improved wallet UX, contributing to 1.5x higher deposit flow
                </h4>

                <a style={{ marginLeft: 'auto' }} target="_blank" href="https://www.autodoc.de">
                  <h4>[Website Link]</h4>
                </a>

                <br />
                <br />

                <h3>Codemotion Ninjas, Senior Frontend Developer</h3>
                <h5>Crypto-Swap Widget</h5>
                <h5>(Jan 2018 - Dec 2020) · 3 yrs</h5>
                <h4>
                  Built product from scratch, led frontend team, and improved customer delivery and release speed for Web3 startups
                </h4>

                <a style={{ marginLeft: 'auto' }} target="_blank" href="https://www.swipelux.com/">
                  <h4>[Website Link]</h4>
                </a>

                <br />
                <br />

                <h3>IdeaSoft, Middle Frontend Developer</h3>
                <h5>Blockchain</h5>
                <h5>(Nov 2015 - Jan 2018) · 2 yrs 3 mos</h5>
                <h4>
                  Built high functionalities React.js explorer for Stellar, direct interact with blockchain, mentoring, leading team
                </h4>

                <a style={{ marginLeft: 'auto' }} target="_blank" href="https://unbounded.network/">
                  <h4>[Website Link]</h4>
                </a>

                <br />
                <br />

                <h3>Jelvix, Junior Software Developer</h3>
                <h5>Web Consalting</h5>
                <h5>(Oct 2013 - Oct 2015) · 2 yrs 1 mo</h5>
                <h4>
                  Improving SEO for more conversions, custom SSR solution for Angular JS (1), deliver business features
                </h4>

                <h4><a style={{ marginLeft: 'auto' }} target="_blank" href="https://jelvix.com">
                  [Website Link]
                </a></h4>
              </div>

              <div style={{ position: 'absolute',  display: 'flex', flexDirection: 'column', top: '535vh', left: '4em', width: '80vw' }}>
              <RevealText as="h1" delay={0.5} text="Custom Solutions:" />
              <br />
              <br />
              <RevealText as="h3" delay={0.5} text="Gastro & Me, Senior Engineer" />
              <RevealText as="h5" delay={0.5} text="Ed-tech" />
              <RevealText as="h4" delay={0.5}
                          text="Design UI/UX, build iOS cooking video application with infinity scroll feed" />
              <RevealText as="h4" delay={0.5}
                          text="5000+ downloads in App Store" />

              <a style={{ marginLeft: 'auto'}} target="_blank" href="https://www.autodoc.de"><RevealText as="h4" delay={0.5}
                                                                                                         text="[App Store Link]" /></a>

              <br />
              <br />
              <RevealText as="h3" delay={0.5} text="Talegram, Senior Engineer" />
              <RevealText as="h5" delay={0.5} text="Ed-tech" />
              <RevealText as="h4" delay={0.5}
                          text="Streaming Audio Book plaftorm inside Telegram messager, served 10k users per month" />

              <a style={{ marginLeft: 'auto'}} target="_blank" href="https://www.autodoc.de"><RevealText as="h4" delay={0.5}
                                                                                                         text="[Telegram Link]" /></a>
            </div>
            <div style={{ position: 'absolute', top: '630vh', left: '30vw', width: '80vw' }}>
              <RevealText as="h1" delay={2} text="Contact:" />
              <br />
              <br />
              <RevealText as="h3" delay={0.5} text="Email: denys.kozak.self@gmail.com" />
            </div></>}
            {/*<div style={{ position: 'absolute', top: '260vh', left: '0.5vw', fontSize: '40vw' }}>home</div>*/}
          </Scroll>
        </ScrollControls>
        <Preload />
      </Suspense>
    </Canvas>
  )
}
